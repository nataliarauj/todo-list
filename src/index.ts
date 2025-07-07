(() => {
    enum NotificationPlarform {
        SMS = 'SMS',
        EMAIL = 'EMAIL',
        PUSH = 'PUSH',
    }

    enum ViewMode {
        TODO = 'TODO',
        REMINDER = 'REMINDER',
    }

    interface Task {
        id: string;
        dateCreated: Date;
        dateUpdated: Date;
        description: string;
        render(): string;
    }

    const UUID = ():string => {
        return Math.random().toString(32).substring(2, 9);
    }

    const DateUtils = {
        today(): Date {
            return new Date;
        },

        tomorrow(): Date {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            return tomorrow;
        },

        formatDate(date: Date): string {
            return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
        }
    }

    class Reminder implements Task {
        id: string = UUID();
        dateCreated: Date = DateUtils.today();
        dateUpdated: Date = DateUtils.today();
        description: string = '';
        date: Date = new Date();
        notifications: Array<NotificationPlarform> = [NotificationPlarform.EMAIL];

        constructor(description: string, date: Date, notifications: Array<NotificationPlarform>){
            this.description = description;
            this.date = date;
            this.notifications = notifications;
        }

        render(): string {
            return `
            ---> Reminder <---
            description: ${this.description}
            date: ${DateUtils.formatDate(this.date)}
            platform: ${this.notifications.join(',')}
            `;
        }
    }


    class Todo implements Task {
        id: string = UUID();
        dateCreated: Date = DateUtils.today();
        dateUpdated: Date = DateUtils.today();
        description: string = '';
        done: boolean = false;

        constructor(description: string) {
            this.description = description;
        }

        render(): string {
            return `
            ---> TODO <---
            description: ${this.description}
            done: ${this.done}
            `;
        }
    }

    const taskView = {
        getTodo(form: HTMLFormElement): Todo {
            const todoDescription = form.todoDescription.value;
            form.reset();
            return new Todo(todoDescription);
        },

        getReminder(form: HTMLFormElement): Reminder {
            const reminderNotifications = [
                form.notifications.value as NotificationPlarform,
            ];

            const reminderDate = new Date(form.reminderDate.value);
            const reminderDescription = form.reminderDescription.value;
            form.reset();
            return new Reminder (
                reminderDescription,
                reminderDate,
                reminderNotifications
            );
        },

        render(tasks: Array<Task>, mode: ViewMode) {
            const taskList = document.getElementById('taskList');
            while (taskList?.firstChild) {
                taskList.removeChild(taskList.firstChild);
            }

            tasks.forEach((task) => {
                const li = document.createElement('li');
                const textNode = document.createTextNode((task.render()));
                li.appendChild(textNode);
                taskList?.appendChild(li);
            });

            const todoSet = document.getElementById('todoSet');
            const reminderSet = document.getElementById('reminderSet');

            if (mode === ViewMode.TODO) {
                todoSet?.setAttribute('style', 'display: block');
                todoSet?.removeAttribute('disabled');
                reminderSet?.setAttribute('style', 'display: none');
                reminderSet?.setAttribute('disabled', 'true');
            } else {
                reminderSet?.setAttribute('style', 'display: block');
                reminderSet?.removeAttribute('disabled');
                todoSet?.setAttribute('style', 'display: none');
                todoSet?.setAttribute('disabled', 'true');
            }
        },
    };

    const TaskController = (view: typeof taskView) => {
        const tasks: Array <Task> = [];
        let mode: ViewMode = ViewMode.TODO;

        view.render(tasks, mode);
        
        const handleEvent = (event: Event) => {
            event.preventDefault();
            console.log("Modo atual:", mode);
            const form = event.target as HTMLFormElement;
            switch (mode as ViewMode) {
                case ViewMode.TODO:
                    tasks.push(view.getTodo(form));
                    break;
                case ViewMode.REMINDER:
                    tasks.push(view.getReminder(form));
                    break;
            }
            view.render(tasks, mode);
        };

        const handleToggleMode = () => {
            switch (mode as ViewMode) {
                case ViewMode.TODO:
                    mode = ViewMode.REMINDER;
                    break;
                case ViewMode.REMINDER:
                    mode = ViewMode.TODO;
                    break;
            }

            view.render(tasks, mode);
        }

        document.getElementById('toggleMode')
        ?.addEventListener('click', handleToggleMode);


        document.getElementById('taskForm')
        ?.addEventListener('submit', handleEvent);
    }; 

    TaskController(taskView);
})();