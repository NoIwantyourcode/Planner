let cards = JSON.parse(localStorage.getItem('cards') || '[]');
let columns = JSON.parse(localStorage.getItem('columns') || '["todo","inprogress","done"]')
let columnColors = JSON.parse(localStorage.getItem('columnColors') || '{}')

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

        if (card.due) {
            const dueE1 = document.createElement('div');
            dueE1.classList.add('due');
            dueE1.textContent = card.due;
            const isOverdue = new Date(card.due) < new Date();
            if (isOverdue) dueE1.classList.add('overdue');
            cardE1.appendChild(dueE1);
        }

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
        const container = document.querySelector(`#${card.column} .cards`);
        if (!container) return;
        container.appendChild(cardE1);

        cardE1.draggable = true;

        cardE1.addEventListener('dragstart', () => {
            cardE1.classList.add('dragging');
            setTimeout(() => cardE1.classList.add('dragging'), 0);
            window.draggedId = card.id;
        });

        const editBtn = document.createElement('button');
        editBtn.textContent = 'edit';
        editBtn.classList.add('editBtn');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const input = document.createElement('input');
            input.type = 'text';
            input.value = card.title;
            input.classList.add('editInput');
            cardE1.replaceChild(input, cardE1.querySelector('.card-title') || input)
            cardE1.textContent = '';
            cardE1.appendChild(input);
            input.focus();

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && input.value.trim()) {
                    card.title = input.value.trim();
                    localStorage.setItem('cards', JSON.stringify(cards));
                    renderCards();
                }
                if (e.key === 'Escape') renderCards();
            })
        })
        cardE1.appendChild(editBtn);

        cardE1.addEventListener('click', () => {
            document.getElementById('dialogTitle').textContent = card.title;
            document.getElementById('dialogDesc').value = card.description || '';
            document.getElementById('cardDialog').showModal();
            document.getElementById('saveDesc').onclick = () => {
                card.description = document.getElementById('dialogDesc').value;
                localStorage.setItems('cards', JSON.stringify(cards));
                document.getElementById('cardDialog').close();
            };
        });

        document.getElementById('closeDialog').addEventListener('click', () => {
            document.getElementById('cardDialog').close();
        });

        const moveLeft = document.createElement('button');
        moveLeft.textContent = '<';
        moveLeft.classList.add('moveBtn');
        moveLeft.addEventListener('click', (e) => {
            e.stopPropagation();
            const currentIndex = columns.indexOf(card.column);
            if (currentIndex > 0) {
                card.column = columns[currentIndex - 1];
                localStorage.setItem('cards', JSON.stringify(cards));
                renderCards();
            }
        })

        const moveRight = document.createElement('button');
        moveRight.textContent = '>';
        moveRight.classList.add('moveBtn');
        moveRight.addEventListener('click', (e) => {
            e.stopPropagation();
            const currentIndex = columns.indexOf(card.column);
            if (currentIndex < columns.length - 1) {
                card.column = columns[currentIndex + 1];
                localStorage.setItem('cards', JSON.stringify(cards));
                renderCards();
            }
        });
        
        cardE1.appendChild(moveLeft);
        cardE1.appendChild(moveRight);
    });

    document.querySelectorAll('.column').forEach(col => {
        const count = cards.filter(c => c.column === col.id).length;
        col.querySelector('.count').textContent = count;
    })
};

function setupDragListeners() {
    document.querySelectorAll('.column').forEach(col => {
        col.addEventListener('dragover', e => e.preventDefault());
        col.addEventListener('drop', () => {
            const columnId = col.id;
            const c = cards.find(c => c.id === window.draggedId);
            if (c) {
                c.column = columnId;
                localStorage.setItem('cards', JSON.stringify(cards));
                renderCards();
            };
        });
    });
}

function setupAddCardListeners() {
    document.querySelectorAll('.addCardBtn').forEach(btn => {
        btn.addEventListener('click', () => {
            const col = btn.closest('.column').querySelector('.cards');
            if (!col) return;
            if (col.querySelector('.newCardForm')) return;

            const form = document.createElement('div');
            form.classList.add('newCardForm');
            form.innerHTML = `
                <input type="text" class="newCardTitle" placeholder="Card Title...">
                <select class="newCardPriority">
                    <option value="low">low</option>
                    <option value="medium">medium</option>
                    <option value="high">High</option>
                </select>
                <input type="date" class="newCardDue">
                <button class="submitCard">Add</button>
                <button class="cancelCard">Cancel</button>
            `;
            col.prepend(form);
            form.querySelector('.newCardTitle').focus();

            form.querySelector('.submitCard').addEventListener('click', () => {
                const title = form.querySelector('.newCardTitle').value.trim();
                if (!title) return;
                const card = {
                    id: Date.now(),
                    title,
                    priority: form.querySelector('.newCardPriority').value,
                    due: form.querySelector('.newCardDue').value || null,
                    description: '',
                    column: btn.dataset.column
                };
                cards.push(card);
                localStorage.setItem('cards', JSON.stringify(cards));
                form.remove();
                renderCards();
            });

            form.querySelector('.cancelCard').addEventListener('click', () => form.remove());
        });
    });
}

function renderColumns() {
    const board = document.getElementById('board');
    board.innerHTML = '';

    columns.forEach(col => {
        const colE1 = document.createElement('div');
        if (columnColors[col]) {
            colE1.style.background = columnColors[col];
        };
        colE1.classList.add('column');
        colE1.id = col;
        colE1.innerHTML = `
         <div class="col-header">
            <h2>${col} <span class="count">0</span></h2>
            <input type="color" class="colorPicker" value="#e0e0e0">
            <button class="deleteColBtn" data-column="${col}">x</button>
         </div>
         <button class="addCardBtn" data-column="${col}">Add card</button>
         <div class="cards"></div>
        `;
        board.appendChild(colE1);

        colE1.querySelector('.colorPicker').addEventListener('input', (e) => {
            columnColors[col] = e.target.value;
            colE1.style.background = e.target.value;
            localStorage.setItem('columnColors', JSON.stringify(columnColors));
        })

        colE1.querySelector('.deleteColBtn').addEventListener('click', () => {
            if (!confirm(`delete "${col}" and all of its cards?`)) return;
            columns = columns.filter(c => c !== col);
            localStorage.setItem('columns', JSON.stringify(columns));
            localStorage.setItem('cards', JSON.stringify(cards));
            renderColumns();
        })
    });

    renderCards();
    setupDragListeners();
    setupAddCardListeners();
}

document.getElementById('addColumn').addEventListener('click', () => {
    const name = prompt('Column name:');
    if (!name) return;
    const id = name.toLowerCase().replace(/\s+/g, '');
    columns.push(id);
    localStorage.setItem('columns', JSON.stringify(columns));
    renderColumns();
})

renderColumns();