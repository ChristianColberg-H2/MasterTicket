import Models from './models.js';

let dummy = async () => {
    // Roles
    const roles = await Models.Roles.findAll({});
    if (roles.length === 0) {
        await Models.Roles.bulkCreate([
            { name: 'User', description: 'Regular user with standard permissions', permissions: { read: true, write: false, delete: false } },
            { name: 'Admin', description: 'System administrator with full access', permissions: { read: true, write: true, delete: true} },
            { name: 'Moderator', description: 'User responsible for moderating content', permissions: { read: true, write: true, delete: false} },
            { name: 'Supporter', description: 'Handles support requests and assists users', permissions: { read: true, write: true, delete: false} },
        ]);
        console.log('[ORM]\t\tRoles table instantiated.');
    } else {
        console.log('[ORM]\t\tRoles table already exists.');
    }

    // Categories
    const categories = await Models.Categories.findAll();
    if (categories.length === 0) {
        await Models.Categories.bulkCreate([
            { name: 'Technical Support', description: 'Technical issues and troubleshooting' },
            { name: 'Account Issues', description: 'Account-related problems and requests' },
            { name: 'Billing', description: 'Billing and payment related inquiries' },
            { name: 'Feature Request', description: 'Suggestions for new features' },
            { name: 'Bug Report', description: 'Report software bugs and issues' }
        ]);
        console.log('[ORM]\t\tCategories table instantiated.');
    }

    // Status
    const statuses = await Models.Status.findAll();
    if (statuses.length === 0) {
        await Models.Status.bulkCreate([
            { name: 'New', description: 'Ticket has been created but not yet processed' },
            { name: 'In Progress', description: 'Ticket is being worked on' },
            { name: 'Waiting for Customer', description: 'Awaiting customer response' },
            { name: 'On Hold', description: 'Ticket is temporarily suspended' },
            { name: 'Resolved', description: 'Issue has been resolved' },
            { name: 'Closed', description: 'Ticket is closed and completed' }
        ]);
        console.log('[ORM]\t\tStatus table instantiated.');
    }

    // Priorities
    const priorities = await Models.Priorities.findAll();
    if (priorities.length === 0) {
        await Models.Priorities.bulkCreate([
            { name: 'Critical', description: 'Urgent issues requiring immediate attention' },
            { name: 'High', description: 'Important issues that need quick resolution' },
            { name: 'Medium', description: 'Standard priority issues' },
            { name: 'Low', description: 'Non-urgent issues' }
        ]);
        console.log('[ORM]\t\tPriorities table instantiated.');
    }

    // Users
    const users = await Models.Users.findAll();
    if (users.length === 0) {
        const adminRole = await Models.Roles.findOne({ where: { name: 'Admin' } });
        const supportRole = await Models.Roles.findOne({ where: { name: 'Supporter' } });
        const userRole = await Models.Roles.findOne({ where: { name: 'User' } });

        await Models.Users.bulkCreate([
            {
                name: 'Admin User',
                email: 'admin@example.com',
                password_hash: 'admin123', // In real application, ensure this is hashed
                role_id: adminRole.id,
                createdAt: new Date()
            },
            {
                name: 'Support Agent',
                email: 'support@example.com',
                password_hash: 'support123',
                role_id: supportRole.id,
                createdAt: new Date()
            },
            {
                name: 'John Doe',
                email: 'john@example.com',
                password_hash: 'user123',
                role_id: userRole.id,
                createdAt: new Date()
            },
            {
                name: 'Jane Smith',
                email: 'jane@example.com',
                password_hash: 'user123',
                role_id: userRole.id,
                createdAt: new Date()
            }
        ]);
        console.log('[ORM]\t\tUsers table instantiated.');
    }

    // Tickets
    const tickets = await Models.Tickets.findAll();
    if (tickets.length === 0) {
        const user = await Models.Users.findOne({ where: { email: 'john@example.com' } });
        const supporter = await Models.Users.findOne({ where: { email: 'support@example.com' } });
        const category = await Models.Categories.findOne({ where: { name: 'Technical Support' } });
        const status = await Models.Status.findOne({ where: { name: 'New' } });
        const priority = await Models.Priorities.findOne({ where: { name: 'Medium' } });

        await Models.Tickets.bulkCreate([
            {
                user_id: user.id,
                assigned_to_id: supporter.id,
                category_id: category.id,
                status_id: status.id,
                priority_id: priority.id,
                title: 'Cannot login to application',
                description: 'I am unable to login to my account since yesterday.',
                createdAt: new Date()
            },
            {
                user_id: user.id,
                assigned_to_id: supporter.id,
                category_id: category.id,
                status_id: status.id,
                priority_id: priority.id,
                title: 'Feature request: Dark mode',
                description: 'Would it be possible to add dark mode to the application?',
                createdAt: new Date()
            }
        ]);
        console.log('[ORM]\t\tTickets table instantiated.');
    }

    // Comments
    const comments = await Models.Comments.findAll();
    if (comments.length === 0) {
        const ticket = await Models.Tickets.findOne();
        const user = await Models.Users.findOne({ where: { email: 'support@example.com' } });

        await Models.Comments.bulkCreate([
            {
                ticket_id: ticket.id,
                user_id: user.id,
                content: 'Thank you for reporting this. Could you please provide more details about the error message you are seeing?',
                createdAt: new Date()
            }
        ]);
        console.log('[ORM]\t\tComments table instantiated.');
    }
};

export default dummy;