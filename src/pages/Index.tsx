import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

type Priority = 'high' | 'medium' | 'low';
type TaskStatus = 'active' | 'completed';

interface Task {
  id: string;
  title: string;
  priority: Priority;
  tags: string[];
  deadline?: Date;
  completed: boolean;
}

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Подготовить презентацию для клиента',
      priority: 'high',
      tags: ['работа', 'срочно'],
      deadline: new Date(2025, 10, 18),
      completed: false,
    },
    {
      id: '2',
      title: 'Купить продукты',
      priority: 'low',
      tags: ['личное'],
      deadline: new Date(2025, 10, 16),
      completed: false,
    },
    {
      id: '3',
      title: 'Код-ревью нового модуля',
      priority: 'medium',
      tags: ['работа', 'разработка'],
      deadline: new Date(2025, 10, 17),
      completed: false,
    },
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<Priority>('medium');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const addTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      priority: selectedPriority,
      tags: [],
      completed: false,
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const filteredTasks = tasks.filter(task => {
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    if (filterStatus === 'active' && task.completed) return false;
    if (filterStatus === 'completed' && !task.completed) return false;
    return true;
  });

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-amber-500 text-white';
      case 'low':
        return 'bg-emerald-500 text-white';
    }
  };

  const getPriorityLabel = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return 'Высокий';
      case 'medium':
        return 'Средний';
      case 'low':
        return 'Низкий';
    }
  };

  const tasksWithDeadlines = tasks.filter(task => task.deadline && !task.completed);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-foreground mb-3">Таск-менеджер</h1>
          <p className="text-muted-foreground text-lg">Управляйте задачами легко и эффективно</p>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Input
                    placeholder="Добавьте новую задачу..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                    className="flex-1"
                  />
                  <Select value={selectedPriority} onValueChange={(v) => setSelectedPriority(v as Priority)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Высокий</SelectItem>
                      <SelectItem value="medium">Средний</SelectItem>
                      <SelectItem value="low">Низкий</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={addTask} className="gap-2">
                    <Icon name="Plus" size={18} />
                    Добавить
                  </Button>
                </div>

                <div className="flex gap-3 flex-wrap">
                  <Select value={filterPriority} onValueChange={(v) => setFilterPriority(v as Priority | 'all')}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Приоритет" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все приоритеты</SelectItem>
                      <SelectItem value="high">Высокий</SelectItem>
                      <SelectItem value="medium">Средний</SelectItem>
                      <SelectItem value="low">Низкий</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as TaskStatus | 'all')}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все задачи</SelectItem>
                      <SelectItem value="active">Активные</SelectItem>
                      <SelectItem value="completed">Выполненные</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="ml-auto text-sm text-muted-foreground flex items-center gap-2">
                    <Icon name="ListTodo" size={16} />
                    <span>{filteredTasks.length} {filteredTasks.length === 1 ? 'задача' : 'задач'}</span>
                  </div>
                </div>
              </div>
            </Card>

            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <Card
                  key={task.id}
                  className={`p-5 shadow-sm hover:shadow-md transition-all ${
                    task.completed ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(task.id)}
                      className="mt-1"
                    />
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <h3
                          className={`text-lg font-medium ${
                            task.completed ? 'line-through text-muted-foreground' : ''
                          }`}
                        >
                          {task.title}
                        </h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteTask(task.id)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Icon name="Trash2" size={18} />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getPriorityColor(task.priority)}>
                          {getPriorityLabel(task.priority)}
                        </Badge>
                        
                        {task.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="gap-1">
                            <Icon name="Tag" size={12} />
                            {tag}
                          </Badge>
                        ))}

                        {task.deadline && (
                          <Badge variant="secondary" className="gap-1">
                            <Icon name="Calendar" size={12} />
                            {task.deadline.toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {filteredTasks.length === 0 && (
                <Card className="p-12 text-center">
                  <Icon name="CheckCircle2" size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground text-lg">Нет задач</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {filterStatus === 'all' ? 'Добавьте первую задачу' : 'Попробуйте изменить фильтры'}
                  </p>
                </Card>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <Card className="p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Icon name="CalendarDays" size={22} />
                Календарь
              </h2>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md"
              />
            </Card>

            <Card className="p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Icon name="Clock" size={22} />
                Ближайшие дедлайны
              </h2>
              <div className="space-y-3">
                {tasksWithDeadlines.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Нет задач с дедлайнами
                  </p>
                ) : (
                  tasksWithDeadlines
                    .sort((a, b) => (a.deadline!.getTime() - b.deadline!.getTime()))
                    .slice(0, 5)
                    .map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className={`w-2 h-2 rounded-full ${
                          task.priority === 'high' ? 'bg-red-500' :
                          task.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{task.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {task.deadline!.toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'long',
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </Card>

            <Card className="p-6 shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">{tasks.filter(t => !t.completed).length}</h3>
                  <Icon name="ListTodo" size={24} className="text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">Активных задач</p>
                
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Выполнено</span>
                    <span className="font-semibold">{tasks.filter(t => t.completed).length}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
