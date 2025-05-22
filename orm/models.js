import sequelize from './database.js';
import Roles from "./models/roles.js";
import Categories from "./models/categories.js";
import Status from "./models/status.js";
import Priorities from "./models/priorities.js";
import Users from "./models/users.js";
import Tickets from "./models/tickets.js";
import Comments from "./models/comments.js";
import Attachments from "./models/attachments.js";

export default {
    sequelize,
    Attachments,
    Categories,
    Comments,
    Priorities,
    Roles,
    Status,
    Tickets,
    Users
}