let cards = JSON.parse(localStorage.getItem('cards') || '[]');

function renderCards() {
    document.querySelectorAll('.cards').forEach(col => col.innerHTML = '');

    cards.forEach(card => {
        const cardE1 = document.createElement('div');
        cardE1.classList.add('card');
        cardE1.textContent = card.title;

        const tag = document.createElement('span');
        tag.classList.add('priority', card.priority);
        tag.textContent = card.priority;
        cardE1.prepend(tag);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'x';
        deleteBtn.classList.add('deleteBtn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            cards = cards.filter(c => c.id !== card.id);
            localStorage.setItem('cards', JSON.stringify(cards));
            renderCards()
        });

        cardE1.appendChild(deleteBtn);
        cardE1.dataset.id = card.it;
        document.querySelector(`#${card.column} .cards`).appendChild(cardE1);
    })
}

document.querySelectorAll('.addCardBtn').forEach(btn => {
    btn.addEventListener('click', () => {
        const title = prompt('Card title');
        const priority = prompt('Priority (low, medium, high):');
        const due = prompt('Due Date (DD/MM/YY):')
        if (!title) return;
        const card = {
            id: Date.now(),
            title: title,
            priority: priority || 'low',
            due: due || null,
            column: btn.dataset.column
        };
        cards.push(card);
        localStorage.setItem('cards', JSON.stringify(cards));
        renderCards();
    });
})

renderCards();