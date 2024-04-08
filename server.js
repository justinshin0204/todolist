const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/todoListDB');

const todoSchema = new mongoose.Schema({
    text: String,
    completed: { type: Boolean, default: false }
});
const Todo = mongoose.model('Todo', todoSchema);



//api
app.get('/', async (req, res) => {
    try {
        
        const tasks = await Todo.find({});
        
        res.render('index', { todoTasks: tasks });
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while retrieving tasks.");
    }
});
app.post('/complete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const task = await Todo.findById(id);
        task.completed = !task.completed; 
        await task.save();
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while updating the task.");
    }
});
app.post('/add', (req, res) => {
    const newTask = new Todo({
        text: req.body.task,
        completed: false
    });
    newTask.save().then(() => res.redirect('/'));
});

app.get('/edit/:id', async (req, res) => {
    try {
        const id = req.params.id;
        
        const taskToEdit = await Todo.findById(id); // 편집할 할 일 조회

        
        res.render('edit', { todoTasks});
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while fetching tasks.");
    }
});
app.post('/edit/:id', async (req, res) => {
    const { id } = req.params; //URL에서 ID 추출
    const { task } = req.body; //폼 데이터에서 업데이트할 할 일 내용 추출

    try {
        //할 일을 업데이트
        await Todo.findByIdAndUpdate(id, { text: task });
        res.redirect('/'); //업데이트 후 메인 페이지로 리다이렉트
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while updating the task.");
    }
});
app.post('/remove/:id', async (req, res) => {
    try {
        await Todo.findByIdAndDelete(req.params.id);
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while deleting the task.");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));