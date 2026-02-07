import { animate } from 'motion';

export interface CardLayoutManager {
  applyDynamicSizing: (container: Element) => Promise<void>;
}

export function createCardLayoutManager(): CardLayoutManager {
  async function applyDynamicSizing(container: Element) {
    const cards = Array.from(container.querySelectorAll('.project-card:not(.hidden)'));
    const firstRow = container.querySelector('.project-row-primary') as HTMLElement;
    const secondRow = container.querySelector('.project-row-secondary') as HTMLElement;

    if (!firstRow || !secondRow) return;

    // Remove all cards from rows (but keep them in memory)
    const cardElements = [...cards];
    cards.forEach(card => card.remove());

    // Clear size classes
    cardElements.forEach(card => {
      card.classList.remove('card-size-featured', 'card-size-secondary', 'card-size-small');
    });

    // Determine new layout
    if (cardElements.length === 0) {
      firstRow.classList.add('hidden');
      secondRow.classList.add('hidden');
      return;
    }

    if (cardElements.length === 1) {
      // Solo featured
      cardElements[0].classList.add('card-size-featured');
      firstRow.appendChild(cardElements[0]);
      firstRow.classList.remove('hidden');
      secondRow.classList.add('hidden');
    } else if (cardElements.length === 2) {
      // Featured + Secondary
      cardElements[0].classList.add('card-size-featured');
      cardElements[1].classList.add('card-size-secondary');
      firstRow.appendChild(cardElements[0]);
      firstRow.appendChild(cardElements[1]);
      firstRow.classList.remove('hidden');
      secondRow.classList.add('hidden');
    } else {
      // Featured + Secondary en primera fila, resto en grid
      cardElements[0].classList.add('card-size-featured');
      cardElements[1].classList.add('card-size-secondary');
      firstRow.appendChild(cardElements[0]);
      firstRow.appendChild(cardElements[1]);
      firstRow.classList.remove('hidden');

      // Small cards en segunda fila
      cardElements.slice(2).forEach(card => {
        card.classList.add('card-size-small');
        secondRow.appendChild(card);
      });
      secondRow.classList.remove('hidden');
    }

    // Animate cards
    await Promise.all(
      cardElements.map(card =>
        animate(card,
          { opacity: [0, 1], scale: [0.95, 1] },
          { duration: 0.3, easing: 'ease-out' }
        ).finished
      )
    );
  }

  return { applyDynamicSizing };
}
