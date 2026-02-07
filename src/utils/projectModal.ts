import { animate } from 'motion';

interface ProjectDetails {
  challenge: string;
  solution: string;
  results: string[];
  duration: string;
  role: string;
}

interface ProjectLinks {
  live?: string | null;
  github?: string | null;
  caseStudy?: string | null;
}

interface Project {
  id: string;
  category: string;
  title: string;
  description: string;
  longDescription: string;
  tech: string[];
  metric: string;
  image: string;
  details: ProjectDetails;
  links: ProjectLinks;
}

let currentFocusedElement: HTMLElement | null = null;
let isOpen = false;

export function setupProjectModal() {
  const modal = document.getElementById('project-modal');
  if (!modal) return;

  const backdrop = modal.querySelector('[data-modal-backdrop]') as HTMLElement;
  const closeBtn = modal.querySelector('[data-modal-close]') as HTMLElement;
  const content = modal.querySelector('[data-modal-content]') as HTMLElement;
  const title = modal.querySelector('#modal-title') as HTMLElement;
  const container = modal.querySelector('.modal-container') as HTMLElement;

  if (!backdrop || !closeBtn || !content || !title || !container) return;

  // Close handlers
  const closeModal = async () => {
    if (!isOpen) return;

    await Promise.all([
      animate(backdrop, { opacity: [1, 0] }, { duration: 0.2 }).finished,
      animate(container,
        { opacity: [1, 0], scale: [1, 0.95], y: [0, 10] },
        { duration: 0.2 }
      ).finished
    ]);

    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    isOpen = false;

    if (currentFocusedElement) {
      currentFocusedElement.focus();
      currentFocusedElement = null;
    }
  };

  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      closeModal();
    }
  });

  // Open modal function
  window.openProjectModal = async (project: Project) => {
    currentFocusedElement = document.activeElement as HTMLElement;

    // Set title
    title.textContent = project.title;

    // Generate content
    content.innerHTML = `
      <div class="modal-image-container">
        <img
          src="${project.image}"
          alt="${project.title}"
          class="modal-image"
          loading="lazy"
        />
      </div>

      <div class="modal-section">
        <span class="modal-category">${project.category}</span>
        <p class="modal-description">${project.longDescription}</p>
      </div>

      <div class="modal-section">
        <h3 class="modal-section-title">Tecnologías</h3>
        <div class="modal-tech-list">
          ${project.tech.map(tech => `
            <span class="modal-tech-tag">${tech}</span>
          `).join('')}
        </div>
      </div>

      ${project.details.challenge ? `
        <div class="modal-section">
          <h3 class="modal-section-title">Desafío</h3>
          <p class="modal-text">${project.details.challenge}</p>
        </div>
      ` : ''}

      ${project.details.solution ? `
        <div class="modal-section">
          <h3 class="modal-section-title">Solución</h3>
          <p class="modal-text">${project.details.solution}</p>
        </div>
      ` : ''}

      ${project.details.results && project.details.results.length > 0 ? `
        <div class="modal-section">
          <h3 class="modal-section-title">Resultados</h3>
          <ul class="modal-results-list">
            ${project.details.results.map(result => `
              <li class="modal-result-item">
                <span class="material-symbols-outlined">check_circle</span>
                ${result}
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}

      <div class="modal-meta">
        ${project.details.duration ? `
          <div class="modal-meta-item">
            <span class="material-symbols-outlined">schedule</span>
            <span>${project.details.duration}</span>
          </div>
        ` : ''}
        ${project.details.role ? `
          <div class="modal-meta-item">
            <span class="material-symbols-outlined">person</span>
            <span>${project.details.role}</span>
          </div>
        ` : ''}
      </div>

      ${(project.links.live || project.links.github || project.links.caseStudy) ? `
        <div class="modal-actions">
          ${project.links.live ? `
            <a href="${project.links.live}" target="_blank" rel="noopener noreferrer" class="modal-btn modal-btn-primary">
              <span class="material-symbols-outlined">open_in_new</span>
              Ver proyecto
            </a>
          ` : ''}
          ${project.links.github ? `
            <a href="${project.links.github}" target="_blank" rel="noopener noreferrer" class="modal-btn modal-btn-secondary">
              <span class="material-symbols-outlined">code</span>
              Ver código
            </a>
          ` : ''}
        </div>
      ` : ''}
    `;

    // Show modal
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    isOpen = true;

    // Animate in
    backdrop.style.opacity = '0';
    container.style.opacity = '0';
    container.style.transform = 'scale(0.9) translateY(20px)';

    await Promise.all([
      animate(backdrop, { opacity: [0, 1] }, { duration: 0.25, easing: 'ease-out' }).finished,
      animate(container,
        { opacity: [0, 1], scale: [0.9, 1], y: [20, 0] },
        { duration: 0.3, easing: [0.16, 1, 0.3, 1] }
      ).finished
    ]);

    closeBtn.focus();
  };
}

declare global {
  interface Window {
    openProjectModal: (project: any) => Promise<void>;
  }
}
