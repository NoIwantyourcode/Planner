let cards = JSON.parse(localStorage.getItem('cards') || '[]');
let columns = JSON.parse(localStorage.getItem('columns') || '["todo","inprogress","done"]')
let columnColors = JSON.parse(localStorage.getItem('columns') || '{}')

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
            const newTitle = prompt('Edit title:', card.title);
            if (!newTitle) return;
            card.title = newTitle;
            localStorage.setItem('cards', JSON.stringify(cards));
            renderCards();
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

            if (col.querySelector('.newCardInput')) return;

            const input = document.createElement('input')
            input.type = 'text';
            input.classList.add('newCardInput');
            input.placeholder = 'Card title...';
            col.prepend(input);
            input.focus();

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && input.value.trim()) {
                    const card = {
                        id: Date.now(),
                        title: input.value.trim(),
                        priority: 'low',
                        due: null,
                        description: '',
                        column: btn.dataset.column
                    };
                    cards.push(card)
                    localStorage.setItem('cards', JSON.stringify(cards));
                    renderCards();
                }
                if (e.key === 'Escape' || e.key === 'Enter') {
                    input.remove()
                }
            });
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