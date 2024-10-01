class Task {
    id;
    title;
    description;
    category;
    assigned_users = [];
    due_date;
    priority;
    state;
    subTask = [];

    constructor(id, title, description, category, assigned_users, due_date, priority, state) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.assigned_users = assigned_users;
        this.due_date = due_date;
        this.priority = priority;
        this.state = state;
        //this.mapSubTask(subTask)
    }

    // mapSubTask(subTask) {
    //     this.subTask = subTask.map(subTask => new SubTask(
    //         subTask.descr,
    //         subTask.state,
    //     ))
    // }
}

// class SubTask {
//     descr;
//     state;

//     constructor(descr, state) {
//         this.descr = descr;
//         this.state = state;
//     }
// }


