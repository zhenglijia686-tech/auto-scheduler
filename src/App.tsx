import { useState } from 'react';
import './App.css';

interface ScheduledTask {
  id: string;
  name: string;
  duration: number;        // 分钟
  priority: 'High' | 'Medium' | 'Low';
  startTime: Date;
  endTime: Date;
}

function App() {
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);

  // 表单输入
  const [taskName, setTaskName] = useState('');
  const [duration, setDuration] = useState(30);
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [startTime, setStartTime] = useState('09:00'); // 新任务的起始时间

  // 将 "HH:MM" 转换为今天的 Date 对象
  const parseTimeToDate = (timeStr: string): Date => {
    const [hour, minute] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date;
  };

  // 格式化时间用于 input 显示（HH:MM）
  const formatTimeForInput = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // 格式化结束时间显示，若跨天则添加 (+1) 标记
  const formatEndTimeWithDay = (date: Date, startDate: Date): string => {
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isNextDay = date.getDate() !== startDate.getDate() ||
                      date.getMonth() !== startDate.getMonth() ||
                      date.getFullYear() !== startDate.getFullYear();
    return isNextDay ? `${timeStr} (+1)` : timeStr;
  };

  // 添加新任务（完全手动指定起始时间）
  const addTask = () => {
    if (!taskName.trim()) return;

    const startDateTime = parseTimeToDate(startTime);
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + duration);

    const newTask: ScheduledTask = {
      id: crypto.randomUUID(),
      name: taskName,
      duration,
      priority,
      startTime: startDateTime,
      endTime: endDateTime,
    };

    setScheduledTasks([...scheduledTasks, newTask]);

    // 清空输入（起始时间保留，方便连续添加）
    setTaskName('');
    setDuration(30);
    setPriority('Medium');
    // 注意：起始时间不清空，保留用户上次输入的值
  };

  // 修改任务的开始时间
  const handleStartTimeChange = (taskId: string, newTimeStr: string) => {
    setScheduledTasks(prev =>
      prev.map(task => {
        if (task.id !== taskId) return task;
        const newStart = parseTimeToDate(newTimeStr);
        const newEnd = new Date(newStart);
        newEnd.setMinutes(newEnd.getMinutes() + task.duration);
        return { ...task, startTime: newStart, endTime: newEnd };
      })
    );
  };

  // 修改任务的持续时间
  const handleDurationChange = (taskId: string, newDuration: number) => {
    setScheduledTasks(prev =>
      prev.map(task => {
        if (task.id !== taskId) return task;
        const newEnd = new Date(task.startTime);
        newEnd.setMinutes(newEnd.getMinutes() + newDuration);
        return { ...task, duration: newDuration, endTime: newEnd };
      })
    );
  };

  // 删除任务
  const handleDeleteTask = (taskId: string) => {
    setScheduledTasks(prev => prev.filter(task => task.id !== taskId));
  };

  return (
    <div className="container">
      <h1>智能日程管理器</h1>

      <div className="input-section">
        <input
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          placeholder="今天要做什么？"
        />
        <div className="input-group">
          <label>时长 (分):</label>
          <input
            type="number"
            min="1"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          />
        </div>
        <div className="input-group">
          <label>优先级:</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
          >
            <option value="High">高</option>
            <option value="Medium">中</option>
            <option value="Low">低</option>
          </select>
        </div>
        <div className="input-group">
          <label>起始时间:</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        <button onClick={addTask}>添加任务</button>
      </div>

      <div className="schedule-section">
        <h2>今日排期</h2>
        {scheduledTasks.length === 0 ? (
          <p className="empty-state">尚未安排任务，开始添加吧！</p>
        ) : (
          <div className="timeline">
            {scheduledTasks.map((task) => {
              const startTimeStr = formatTimeForInput(task.startTime);
              const endTimeDisplay = formatEndTimeWithDay(task.endTime, task.startTime);

              return (
                <div
                  key={task.id}
                  className={`task-card priority-${task.priority.toLowerCase()}`}
                >
                  <div className="task-time">
                    <input
                      type="time"
                      value={startTimeStr}
                      onChange={(e) => handleStartTimeChange(task.id, e.target.value)}
                    />
                    {' - '}
                    <span>{endTimeDisplay}</span>
                  </div>
                  <div className="task-info">
                    <span className="task-name">{task.name}</span>
                    <span className="task-badge">{task.priority}</span>
                  </div>
                  <div className="task-duration">
                    时长:
                    <input
                      type="number"
                      min="1"
                      value={task.duration}
                      onChange={(e) =>
                        handleDurationChange(task.id, Number(e.target.value))
                      }
                      style={{ width: '70px', marginLeft: '0.5rem' }}
                    />
                    分钟
                  </div>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    style={{
                      marginTop: '0.5rem',
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    删除
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
