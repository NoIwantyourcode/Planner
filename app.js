let cards = JSON.parse(localStorage.getItem('cards') || '[]');

function renderCards() {
    document.querySelectorAll('.cards').forEach(col => col.innerHTML = '');

    cards.forEach(card => {
        const cardE1 = document.createElement('div');
        cardE1.classList.add('card');
        cardE1.textContent = card.title;
        cardE1.dataset.id = card.it;
        document.querySelector(`#${card.column} .cards`).appendChild(cardE1)
    })
}

document.querySelectorAll('.addCardBtn').forEach(btn => {
    btn.addEventListener('click', () => {
        const title = prompt('Card title');
        if (!title) return;
        const card = {
            id: Date.now(),
            title: title,
            column: btn.dataset.column
        };
        cards.push(card);
        localStorage.setItem('cards', JSON.stringify(cards));
        renderCards();
    });
    cardE1.appendChild(deleteBtn);
})

renderCards()