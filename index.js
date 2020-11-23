const db = require('./db.js');
const inquirer = require('inquirer');

module.exports.add = async (title) => {
  // 读取之前的任务
  let list = await db.read();
  // 添加任务
  list.push({ title, done: false });
  // 存储任务到文件
  await db.write(list);
};

module.exports.clear = async () => {
  await db.write([]);
};

function markAsDone(list, index) {
  list[index].done = true;
  db.write(list);
}

function markAsUnDone(list, index) {
  list[index].done = false;
  db.write(list);
}

function deleteTask(list, index) {
  list.splice(index, 1);
  db.write(list);
}

function rename(list, index) {
  inquirer
    .prompt({
      type: 'input',
      name: 'title',
      message: 'The new title',
      default: list[index].title,
    })
    .then((answer) => {
      list[index].title = answer.title;
      db.write(list);
    });
}

function printTasks(list) {
  inquirer
    .prompt({
      type: 'list',
      name: 'index',
      message: 'Select the task you want to operate.',
      choices: [
        ...list.map((task, index) => {
          return {
            name: `${task.done ? '[√]' : '[_]'} : ${index + 1} - ${task.title}`,
            value: index.toString(),
          };
        }),
        { name: 'Add', value: '-2' },
        { name: 'Exit', value: '-1' },
      ],
    })
    .then((answer) => {
      const index = parseInt(answer.index);
      if (index >= 0) {
        // 选中了一个任务
        selectAction(list, index);
      } else if (index === -2) {
        // 创建任务
        askForCreateTask(list);
      }
    });
}

function selectAction(list, index) {
  const actions = { markAsDone, markAsUnDone, rename, deleteTask };
  inquirer
    .prompt({
      type: 'list',
      name: 'action',
      message: 'Select your action.',
      choices: [
        { name: 'Exit', value: 'exit' },
        { name: 'Mark as done', value: 'markAsDone' },
        { name: 'Mark as undone', value: 'markAsUnDone' },
        { name: 'Rename', value: 'rename' },
        { name: 'Delete', value: 'deleteTask' },
      ],
    })
    .then((answer) => {
      const action = actions[answer.action];
      action && action(list, index);
      //   switch (answer.action) {
      //     case 'markAsDone':
      //       markAsDone(list, index);
      //       break;
      //     case 'markAsUnDone':
      //       markAsUnDone(list, index);
      //       break;
      //     case 'rename':
      //       rename(list, index);
      //       break;
      //     case 'delete':
      //       deleteTask(list, index);
      //       break;
      //     default:
      //       break;
      //   }
    });
}

function askForCreateTask(list) {
  inquirer
    .prompt({
      type: 'input',
      name: 'title',
      message: 'Please input the title',
    })
    .then((answer) => {
      list.push({
        title: answer.title,
        done: false,
      });
      db.write(list);
    });
}

module.exports.showAll = async () => {
  // 读取之前的任务
  const list = await db.read();

  // 打印之前的任务
  printTasks(list);
};
