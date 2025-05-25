let ticketList = document.querySelector('#tickets-container');
let contentSection = document.querySelector('#content-section');

document.addEventListener('DOMContentLoaded', () => {
    getTickets();
    showDefaultContent();

    document.querySelector('#new-ticket-btn').addEventListener('click', createNewTicket)
});

let getTickets = async () => {
    try {
        let response = await fetch('/ticket/tickets');

        if (!response.ok) {
            alert('Failed to fetch tickets');
            return;
        }

        let tickets = (await response.json()).tickets;
        ticketList.innerHTML = '';

        if (tickets.length === 0) {
            let emptyMessage = document.createElement('li');
            emptyMessage.className = 'empty-tickets-message';
            emptyMessage.textContent = 'No tickets found. Create a new ticket to get started.';
            ticketList.appendChild(emptyMessage);
            return;
        }

        for (let ticket of tickets) {
            let ticketItem = document.createElement('li');
            ticketItem.innerHTML = `
                <h3 class="ticket-title">${ticket.title}</h3>
                <p class="ticket-description">${ticket.description}</p>
                <p>Status: ${ticket.status.name}</p>
                <p>Priority: ${ticket.priority.name}</p>
                <p>Category: ${ticket.category.name}</p>
                <button onclick="viewTicket(${ticket.id})">View</button>
        `;

            ticketItem.href="#";
            ticketList.appendChild(ticketItem);
        }
    } catch (err) {
        console.error('Error fetching tickets:', err);
        alert('An error occurred while fetching tickets.');
    }
};

let createNewTicket = async () => {
    try {
        const [categoriesRes, prioritiesRes] = await Promise.all([
            fetch('/ticket/categories'),
            fetch('/ticket/priorities')
        ]);

        if (!categoriesRes.ok || !prioritiesRes.ok) {
            alert('Failed to fetch categories or priorities');
            return;
        }

        const categories = (await categoriesRes.json()).categories;
        const priorities = (await prioritiesRes.json()).priorities;

        const categoryOptions = categories.map(cat =>
            `<option value="${cat.id}">${cat.name}</option>`
        ).join('');

        const priorityOptions = priorities.map(pri =>
            `<option value="${pri.id}">${pri.name}</option>`
        ).join('');

        contentSection.innerHTML = `
            <div class="ticket-form-container">
                <h2>Create New Ticket</h2>
                <form id="new-ticket-form">
                    <div class="form-group">
                        <label for="title">Title</label>
                        <input type="text" id="title" name="title" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="description">Description</label>
                        <textarea id="description" name="description" rows="4" required></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="priority">Priority</label>
                        <select id="priority" name="priority_id" required>
                            <option value="">Select Priority</option>
                            ${priorityOptions}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="category">Category</label>
                        <select id="category" name="category_id" required>
                            <option value="">Select Category</option>
                            ${categoryOptions}
                        </select>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="submit-btn">Submit Ticket</button>
                        <button type="button" class="cancel-btn" id="cancel-ticket-btn">Cancel</button>
                    </div>
                </form>
            </div>
        `;

        document.getElementById('new-ticket-form').addEventListener('submit', submitNewTicket);
        document.getElementById('cancel-ticket-btn').addEventListener('click', showDefaultContent);

    } catch (err) {
        console.error('Error setting up ticket form:', error);
        alert('An error occurred while loading the form');
    }
};

let submitNewTicket = async (e) => {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    const formDataObj = {};
    formData.forEach((value, key) => {
        formDataObj[key] = value;
    });

    try {
        const response = await fetch('/ticket/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formDataObj)
        });

        if (!response.ok) {
            alert('Failed to create ticket');
            return;
        }

        alert('Ticket created successfully');
        form.reset();
        await getTickets();
        showDefaultContent();
    } catch (err) {
        console.error('Error creating ticket:', err);
        alert('An error occurred while creating the ticket');
    }
};

let viewTicket = async (ticketId) => {
    try {
        const response = await fetch(`/ticket/${ticketId}`);

        if (!response.ok) {
            alert('Failed to fetch ticket details');
            return;
        }

        const ticket = (await response.json()).ticket;

        const createdDate = new Date(ticket.created_at).toLocaleString();
        const updatedDate = ticket.updated_at ? new Date(ticket.updated_at).toLocaleString() : 'Not updated';
        const dueDate = ticket.due_date ? new Date(ticket.due_date).toLocaleString() : 'Not set';
        const closedDate = ticket.closed_at ? new Date(ticket.closed_at).toLocaleString() : 'Not closed';

        contentSection.innerHTML = `
            <div class="ticket-details">
                <div class="ticket-header">
                    <h2>${ticket.title}</h2>
                </div>
                
                <div class="ticket-meta">
                    <div class="meta-item">
                        <span class="meta-label">Status:</span>
                        <span class="meta-value status-badge status-${ticket.status.name.toLowerCase()}">${ticket.status.name}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Priority:</span>
                        <span class="meta-value priority-badge priority-${ticket.priority.name.toLowerCase()}">${ticket.priority.name}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Category:</span>
                        <span class="meta-value">${ticket.category.name}</span>
                    </div>
                </div>
                
                <div class="ticket-description-full">
                    <h3>Description</h3>
                    <p>${ticket.description}</p>
                </div>
                
                <div class="ticket-dates">
                    <div class="date-item">
                        <span class="date-label">Created:</span>
                        <span class="date-value">${createdDate}</span>
                    </div>
                    <div class="date-item">
                        <span class="date-label">Last Updated:</span>
                        <span class="date-value">${updatedDate}</span>
                    </div>
                    <div class="date-item">
                        <span class="date-label">Due Date:</span>
                        <span class="date-value">${dueDate}</span>
                    </div>
                    <div class="date-item">
                        <span class="date-label">Closed Date:</span>
                        <span class="date-value">${closedDate}</span>
                    </div>
                </div>
                
                <div class="ticket-comments">
                    <h3>Comments</h3>
                    <div id="comments-container">
                        <p class="no-comments">No comments yet.</p>
                    </div>
                    <form id="comment-form" class="add-comment">
                        <input type="hidden" name="ticket_id" value="${ticket.id}">
                        <textarea id="new-comment" name="content" placeholder="Add a comment..." required></textarea>
                        <button type="submit">Add Comment</button>
                    </form>
                </div>
            </div>
        `;

        document.querySelector('#comment-form').addEventListener('submit', addComment);
    } catch (err) {
        console.error('Error fetching ticket details:', err);
        alert('An error occurred while fetching ticket details.');
    }
};

let addComment = async (e) => {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    const formDataObj = {};
    formData.forEach((value, key) => {
        formDataObj[key] = value;
    });

    const response = await fetch('/comment/new', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formDataObj)
    });

    if (!response.ok) {
        alert('Failed to add comment');
        return;
    }

    viewTicket(formDataObj.ticket_id);
};

let showDefaultContent = () => {
    contentSection.innerHTML = `
        <h2>Welcome to the Ticketing System</h2>
        <p>Please select a ticket to view details or create a new ticket.</p>
    `;
};