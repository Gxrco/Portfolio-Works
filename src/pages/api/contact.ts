import type { APIRoute } from 'astro';
import { insertContactMessage } from '../../lib/supabaseClient';

const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 254;
const MAX_MESSAGE_LENGTH = 5000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_WINDOW_MS = Number(import.meta.env.CONTACT_RATE_LIMIT_WINDOW_MS ?? 10 * 60 * 1000);
const RATE_LIMIT_MAX_REQUESTS = Number(import.meta.env.CONTACT_RATE_LIMIT_MAX_REQUESTS ?? 5);
const MIN_FORM_FILL_TIME_MS = Number(import.meta.env.CONTACT_MIN_FORM_FILL_TIME_MS ?? 2500);
const MAX_LINKS_IN_MESSAGE = Number(import.meta.env.CONTACT_MAX_LINKS ?? 3);

type ContactRateLimitStore = Map<string, number[]>;

const globalWithRateLimitStore = globalThis as typeof globalThis & {
  __contactRateLimitStore?: ContactRateLimitStore;
};

const rateLimitStore: ContactRateLimitStore =
  globalWithRateLimitStore.__contactRateLimitStore ?? new Map<string, number[]>();

globalWithRateLimitStore.__contactRateLimitStore = rateLimitStore;

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function normalizeField(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function getClientIpAddress(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }

  return request.headers.get('x-real-ip') ?? 'unknown';
}

function hasExceededRateLimit(ipAddress: string, now = Date.now()) {
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const entries = rateLimitStore.get(ipAddress) ?? [];
  const recentEntries = entries.filter((timestamp) => timestamp >= windowStart);

  if (recentEntries.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateLimitStore.set(ipAddress, recentEntries);
    return true;
  }

  recentEntries.push(now);
  rateLimitStore.set(ipAddress, recentEntries);
  return false;
}

function isSuspiciousTiming(formStartedAtValue: string, now = Date.now()) {
  const formStartedAt = Number(formStartedAtValue);
  if (!Number.isFinite(formStartedAt)) {
    return true;
  }

  return now - formStartedAt < MIN_FORM_FILL_TIME_MS;
}

export const POST: APIRoute = async ({ request }) => {
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return jsonResponse({ ok: false, error: 'Unsupported content type.' }, 415);
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: 'Invalid JSON payload.' }, 400);
  }

  const body = (rawBody ?? {}) as Record<string, unknown>;
  const name = normalizeField(body.name);
  const email = normalizeField(body.email).toLowerCase();
  const message = normalizeField(body.message);
  const website = normalizeField(body.website);
  const formStartedAt = normalizeField(body.formStartedAt);
  const ipAddress = getClientIpAddress(request);

  if (website || isSuspiciousTiming(formStartedAt)) {
    // Return success to avoid teaching bots which protection failed.
    return jsonResponse({ ok: true });
  }

  if (hasExceededRateLimit(ipAddress)) {
    return jsonResponse({ ok: false, error: 'Too many requests. Please try again later.' }, 429);
  }

  if (!name || !email || !message) {
    return jsonResponse({ ok: false, error: 'All fields are required.' }, 400);
  }

  if (name.length > MAX_NAME_LENGTH) {
    return jsonResponse({ ok: false, error: 'Name is too long.' }, 400);
  }

  if (email.length > MAX_EMAIL_LENGTH || !EMAIL_REGEX.test(email)) {
    return jsonResponse({ ok: false, error: 'Email is invalid.' }, 400);
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return jsonResponse({ ok: false, error: 'Message is too long.' }, 400);
  }

  const linksInMessage = message.match(/https?:\/\/|www\./gi)?.length ?? 0;
  if (linksInMessage > MAX_LINKS_IN_MESSAGE) {
    return jsonResponse({ ok: false, error: 'Too many links in message.' }, 400);
  }

  try {
    const result = await insertContactMessage({ name, email, message });
    if (!result.ok) {
      console.error('[contact] insertContactMessage failed:', result.message);
      return jsonResponse({ ok: false, error: 'Could not save your message. Please try again later.' }, 500);
    }

    return jsonResponse({ ok: true });
  } catch (error) {
    console.error('[contact] Unexpected error:', error instanceof Error ? error.message : error);
    return jsonResponse({ ok: false, error: 'Unexpected server error. Please try again later.' }, 500);
  }
};
