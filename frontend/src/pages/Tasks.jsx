import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Button, Form, Modal, Alert,
  Badge, Dropdown, InputGroup, Pagination, Spinner
} from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { taskService } from '../services/taskService';
import LoadingSpinner from '../components/LoadingSpinner';

// Validation schema for task form
const taskSchema = yup.object({
  title: yup
    .string()
    .required('Title is required')
    .max(100, 'Title cannot be more than 100 characters'),
  description: yup
    .string()
    .max(1000, 'Description cannot be more than 1000 characters'),
  status: yup
    .string()
    .oneOf(['pending', 'in-progress', 'completed'], 'Invalid status'),
  priority: yup
    .string()
    .oneOf(['low', 'medium', 'high'], 'Invalid priority'),
  category: yup
    .string()
    .max(50, 'Category cannot be more than 50 characters'),
  dueDate: yup
    .date()
    .nullable()
    .min(new Date(), 'Due date cannot be in the past'),
});

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  // Filters and search
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    category: '',
  });
  
  // Pagination
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    count: 0,
    totalTasks: 0,
  });

  // Form handling
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      category: '',
      dueDate: '',
    }
  });

  useEffect(() => {
    fetchTasks();
  }, [filters, pagination.current]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        ...filters,
        page: pagination.current,
        limit: 10,
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await taskService.getTasks(params);

      if (response.success) {
        setTasks(response.data.tasks);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    reset({
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      category: '',
      dueDate: '',
    });
    setShowModal(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    reset({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      category: task.category || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    });
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    try {
      const taskData = {
        ...data,
        dueDate: data.dueDate || null,
      };

      let response;
      if (editingTask) {
        response = await taskService.updateTask(editingTask._id, taskData);
        toast.success('Task updated successfully!');
      } else {
        response = await taskService.createTask(taskData);
        toast.success('Task created successfully!');
      }

      if (response.success) {
        setShowModal(false);
        fetchTasks();
      }
    } catch (error) {
      console.error('Failed to save task:', error);
      toast.error('Failed to save task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      const response = await taskService.deleteTask(taskId);
      if (response.success) {
        toast.success('Task deleted successfully!');
        fetchTasks();
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task. Please try again.');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await taskService.updateTask(taskId, { status: newStatus });
      if (response.success) {
        toast.success(`Task marked as ${newStatus}!`);
        fetchTasks();
      }
    } catch (error) {
      console.error('Failed to update task status:', error);
      toast.error('Failed to update task status. Please try again.');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    setPagination(prev => ({
      ...prev,
      current: 1,
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      priority: '',
      category: '',
    });
    setPagination(prev => ({
      ...prev,
      current: 1,
    }));
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'info';
      case 'pending': return 'warning';
      default: return 'secondary';
    }
  };

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && tasks.length === 0) {
    return <LoadingSpinner fullScreen message="Loading tasks..." />;
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">📋 My Tasks</h2>
              <p className="text-muted mb-0">
                Manage and track your tasks efficiently
              </p>
            </div>
            <Button variant="primary" onClick={handleCreateTask}>
              ➕ New Task
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
          <Button 
            variant="outline-danger" 
            size="sm" 
            className="ms-2"
            onClick={fetchTasks}
          >
            Retry
          </Button>
        </Alert>
      )}

      {/* Search and Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col md={4}>
              <Form.Label>Search Tasks</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search by title, description, or tags..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
                {filters.search && (
                  <Button
                    variant="outline-secondary"
                    onClick={() => handleFilterChange('search', '')}
                  >
                    ✕
                  </Button>
                )}
              </InputGroup>
            </Col>

            <Col md={2}>
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </Form.Select>
            </Col>

            <Col md={2}>
              <Form.Label>Priority</Form.Label>
              <Form.Select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <option value="">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </Form.Select>
            </Col>

            <Col md={2}>
              <Form.Label>Category</Form.Label>
              <Form.Control
                type="text"
                placeholder="Category"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              />
            </Col>

            <Col md={2}>
              <div className="d-grid">
                <Button variant="outline-secondary" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tasks List */}
      <Row>
        <Col>
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading tasks...</span>
              </Spinner>
            </div>
          ) : tasks.length === 0 ? (
            <Card>
              <Card.Body className="text-center py-5">
                <h5 className="text-muted mb-3">No tasks found</h5>
                <p className="text-muted mb-4">
                  {Object.values(filters).some(f => f) 
                    ? 'Try adjusting your filters or create a new task.'
                    : 'Create your first task to get started!'
                  }
                </p>
                <Button variant="primary" onClick={handleCreateTask}>
                  ➕ Create Task
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <>
              {tasks.map((task) => (
                <Card key={task._id} className="mb-3 task-item">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <h5 className="task-title mb-2">{task.title}</h5>
                        {task.description && (
                          <p className="task-description mb-3">{task.description}</p>
                        )}
                        
                        <div className="task-meta mb-2">
                          <Badge 
                            bg={getStatusVariant(task.status)}
                            className="me-2"
                          >
                            {task.status}
                          </Badge>
                          <Badge 
                            bg={getPriorityVariant(task.priority)}
                            className="me-2"
                          >
                            {task.priority} priority
                          </Badge>
                          {task.category && (
                            <Badge bg="secondary" className="me-2">
                              {task.category}
                            </Badge>
                          )}
                          {task.dueDate && (
                            <Badge 
                              bg={new Date(task.dueDate) < new Date() ? 'danger' : 'info'}
                              className="me-2"
                            >
                              Due: {formatDate(task.dueDate)}
                            </Badge>
                          )}
                        </div>

                        <small className="text-muted">
                          Created: {formatDate(task.createdAt)}
                          {task.updatedAt !== task.createdAt && (
                            <> • Updated: {formatDate(task.updatedAt)}</>
                          )}
                        </small>
                      </div>

                      <div className="task-actions">
                        <Dropdown>
                          <Dropdown.Toggle variant="outline-secondary" size="sm">
                            Actions
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleEditTask(task)}>
                              ✏️ Edit
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            {task.status !== 'in-progress' && (
                              <Dropdown.Item 
                                onClick={() => handleStatusChange(task._id, 'in-progress')}
                              >
                                ▶️ Start
                              </Dropdown.Item>
                            )}
                            {task.status !== 'completed' && (
                              <Dropdown.Item 
                                onClick={() => handleStatusChange(task._id, 'completed')}
                              >
                                ✅ Complete
                              </Dropdown.Item>
                            )}
                            {task.status === 'completed' && (
                              <Dropdown.Item 
                                onClick={() => handleStatusChange(task._id, 'pending')}
                              >
                                🔄 Reopen
                              </Dropdown.Item>
                            )}
                            <Dropdown.Divider />
                            <Dropdown.Item 
                              className="text-danger"
                              onClick={() => handleDeleteTask(task._id, task.title)}
                            >
                              🗑️ Delete
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}

              {/* Pagination */}
              {pagination.total > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>
                    <Pagination.First
                      disabled={pagination.current === 1}
                      onClick={() => setPagination(prev => ({ ...prev, current: 1 }))}
                    />
                    <Pagination.Prev
                      disabled={pagination.current === 1}
                      onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
                    />
                    
                    {[...Array(pagination.total)].map((_, index) => {
                      const page = index + 1;
                      if (
                        page === 1 ||
                        page === pagination.total ||
                        (page >= pagination.current - 2 && page <= pagination.current + 2)
                      ) {
                        return (
                          <Pagination.Item
                            key={page}
                            active={page === pagination.current}
                            onClick={() => setPagination(prev => ({ ...prev, current: page }))}
                          >
                            {page}
                          </Pagination.Item>
                        );
                      }
                      return null;
                    })}

                    <Pagination.Next
                      disabled={pagination.current === pagination.total}
                      onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
                    />
                    <Pagination.Last
                      disabled={pagination.current === pagination.total}
                      onClick={() => setPagination(prev => ({ ...prev, current: pagination.total }))}
                    />
                  </Pagination>
                </div>
              )}

              <div className="text-center text-muted mt-3">
                <small>
                  Showing {tasks.length} of {pagination.totalTasks} tasks
                </small>
              </div>
            </>
          )}
        </Col>
      </Row>

      {/* Task Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingTask ? '✏️ Edit Task' : '➕ Create New Task'}
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Modal.Body>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Task Title *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter task title"
                    {...register('title')}
                    isInvalid={!!errors.title}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.title?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Due Date</Form.Label>
                  <Form.Control
                    type="date"
                    {...register('dueDate')}
                    isInvalid={!!errors.dueDate}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.dueDate?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter task description (optional)"
                {...register('description')}
                isInvalid={!!errors.description}
              />
              <Form.Control.Feedback type="invalid">
                {errors.description?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select {...register('status')}>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Priority</Form.Label>
                  <Form.Select {...register('priority')}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Work, Personal"
                    {...register('category')}
                    isInvalid={!!errors.category}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.category?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  {editingTask ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                editingTask ? 'Update Task' : 'Create Task'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Tasks;