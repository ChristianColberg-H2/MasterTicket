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
            ticketItem.className = 'ticket-item';
            ticketItem.innerHTML = `
                <div class="ticket-content">
                    <h3 class="ticket-title">${ticket.title}</h3>
                    <p class="ticket-status">Status: ${ticket.status.name}</p>
                    <span class="ticket-category">Category: ${ticket.category.name}</span>
                </div>
                <div class="ticket-footer">
                    <button class="view-ticket-btn" onclick="viewTicket(${ticket.id})">View</button>
                </div>

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
                <div class="form-header">
                    <h2>Create New Ticket</h2>
                    <p class="form-subtitle">Fill out the form below to create a new support ticket</p>
                </div>
                
                <form id="new-ticket-form">
                    <div class="form-section">
                        <h3 class="section-title">
                            <i class="fas fa-info-circle"></i>
                            Basic Information
                        </h3>
                        
                        <div class="form-group">
                            <label for="title">Title <span class="required">*</span></label>
                            <input type="text" id="title" name="title" required placeholder="Brief summary of the issue">
                            <small class="form-hint">Be clear and concise (max 100 characters)</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="description">Description <span class="required">*</span></label>
                            <textarea id="description" name="description" rows="5" required placeholder="Detailed explanation of the issue..."></textarea>
                            <small class="form-hint">Include all relevant details and steps to reproduce if applicable</small>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h3 class="section-title">
                            <i class="fas fa-sliders-h"></i>
                            Classification
                        </h3>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="priority">Priority <span class="required">*</span></label>
                                <select id="priority" name="priority_id" required>
                                    <option value="">Select Priority</option>
                                    ${priorityOptions}
                                </select>
                                <small class="form-hint">How urgent is this issue?</small>
                            </div>
                            
                            <div class="form-group">
                                <label for="category">Category <span class="required">*</span></label>
                                <select id="category" name="category_id" required>
                                    <option value="">Select Category</option>
                                    ${categoryOptions}
                                </select>
                                <small class="form-hint">What type of issue is this?</small>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="cancel-btn" id="cancel-ticket-btn">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                        <button type="submit" class="submit-btn">
                            <i class="fas fa-paper-plane"></i> Submit Ticket
                        </button>
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
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;

    submitButton.disabled = true;
    submitButton.classList.add('loading');
    submitButton.innerHTML = '<span class="spinner"></span>';

    const startTime = Date.now();

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

        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 2000 - elapsedTime);

        await new Promise(resolve => setTimeout(resolve, remainingTime));

        if (!response.ok) {
            submitButton.classList.remove('loading');
            submitButton.classList.add('error');
            submitButton.innerHTML = '<span class="icon-error"></span> Failed';

            setTimeout(() => {
                submitButton.classList.remove('error');
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }, 2000);

            return;
        }

        const responseData = await response.json();
        console.log('Ticket created successfully');
        const ticketId = responseData.id;

        submitButton.classList.remove('loading');
        submitButton.classList.add('success');
        submitButton.innerHTML = '<span class="icon-success"></span> Created!';

        form.reset();

        setTimeout(async () => {
            submitButton.classList.remove('success');
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;

            await getTickets();
            if (ticketId) {
                await viewTicket(ticketId);
            } else {
                showDefaultContent();
            }

        }, 2000);
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

        const dateFormatter = new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        const formatDate = (date) => date ? dateFormatter.format(new Date(date)).replace(/\./g, ':').replace(/,/g, '') : null;

        const createdDate = formatDate(ticket.createdAt);
        const updatedDate = formatDate(ticket.updatedAt) || 'Not updated';
        const dueDate = formatDate(ticket.dueDate) || 'Not set';
        const closedDate = formatDate(ticket.closedAt) || 'Not closed';

        let commentsHtml = '<p class="no-comments">No comments yet.</p>';
        if (ticket.comments && ticket.comments.length > 0) {
            commentsHtml = ticket.comments.map(comment => `
            <div class="comment">
                <div class="comment-header">
                    <span class="comment-author">${comment.user.name}</span>
                    <span class="comment-date">${formatDate(comment.createdAt)}</span>
                </div>
                <div class="comment-content">
                    <p class="comment-content">${comment.content}</p>
                </div>
            </div>    
        `).join('');
        }

        contentSection.innerHTML = `
            <div class="ticket-details">
                <div class="ticket-header">
                    <h2>${ticket.title}</h2>
                    <button id="resolve-ticket-btn" onclick="resolveTicket(${ticketId})">Resolve Ticket</button>
                    <button id="cancel-ticket-btn" onclick="cancelTicket(${ticketId})">Cancel Ticket</button>
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
                        ${commentsHtml}
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
        <div class="welcome-container">
            <div class="welcome-header">
                <h2>Welcome to the Ticketing System</h2>
                <p class="welcome-subtitle">Your central hub for managing support tickets</p>
            </div>
            
            <div class="dashboard-summary">
                <div class="summary-card">
                    <div class="summary-icon">
                        <i class="fas fa-ticket-alt"></i>
                    </div>
                    <div class="summary-content">
                        <h3>Manage Tickets</h3>
                        <p>View and respond to open tickets from the sidebar</p>
                    </div>
                </div>
                
                <div class="summary-card">
                    <div class="summary-icon">
                        <i class="fas fa-plus-circle"></i>
                    </div>
                    <div class="summary-content">
                        <h3>Create Tickets</h3>
                        <p>Create new tickets by clicking the "New Ticket" button</p>
                    </div>
                </div>
                
                <div class="summary-card">
                    <div class="summary-icon">
                        <i class="fas fa-comments"></i>
                    </div>
                    <div class="summary-content">
                        <h3>Collaborate</h3>
                        <p>Add comments to tickets to communicate with team members</p>
                    </div>
                </div>
            </div>
            
            <div class="quick-actions">
                <button id="dashboard-new-ticket" class="action-button">
                    <i class="fas fa-plus"></i> Create New Ticket
                </button>
            </div>
        </div>
    `;

    document.getElementById('dashboard-new-ticket').addEventListener('click', createNewTicket);
};

let cancelTicket = async (ticketId) => {
    const response = await fetch(`ticket/cancel/${ticketId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        alert('Failed to cancel ticket');
        return;
    }

    await getTickets();
    showDefaultContent();
};

let resolveTicket = async (ticketId) => {
    const response = await fetch(`ticket/resolve/${ticketId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        alert('Failed to resolve ticket');
        return;
    }

    await getTickets();
    showDefaultContent();
};

let getClosedTickets = async () => {
    try {
        let response = await fetch('/ticket/closed-tickets');
        console.log(response);

        if (!response.ok) {
            alert('Failed to fetch closed tickets');
            return;
        }

        let tickets = (await response.json()).tickets;

        contentSection.innerHTML = '';

        const heading = document.createElement('h2');
        heading.textContent = 'Closed & Resolved Tickets';
        contentSection.appendChild(heading);

        const closedTicketsList = document.createElement('ul');
        closedTicketsList.className = 'closed-tickets-list';
        contentSection.appendChild(closedTicketsList);

        if (tickets.length === 0) {
            let emptyMessage = document.createElement('li');
            emptyMessage.className = 'empty-tickets-message';
            emptyMessage.textContent = 'No closed tickets found.';
            closedTicketsList.appendChild(emptyMessage);
            return;
        }

        for (let ticket of tickets) {
            let ticketItem = document.createElement('li');
            ticketItem.className = 'ticket-item';
            ticketItem.innerHTML = `
                <div class="ticket-content">
                    <h3 class="ticket-title">${ticket.title}</h3>
                    <p class="ticket-status">Status: ${ticket.status.name}</p>
                    <span class="ticket-category">Category: ${ticket.category.name}</span>
                </div>
                <div class="ticket-footer">
                    <button class="view-ticket-btn" onclick="viewTicket(${ticket.id})">View</button>
                </div>
            `;

            closedTicketsList.appendChild(ticketItem);
        }
    } catch (err) {
        console.error('Error fetching closed tickets:', err);
        alert('An error occurred while fetching closed tickets.');
    }
};
