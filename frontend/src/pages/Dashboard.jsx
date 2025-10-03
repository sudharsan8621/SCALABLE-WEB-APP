import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { taskService } from '../services/taskService';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch task statistics and recent tasks in parallel
      const [statsResponse, tasksResponse] = await Promise.all([
        taskService.getTaskStats(),
        taskService.getTasks({ limit: 5 })
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data.stats);
      }

      if (tasksResponse.success) {
        setRecentTasks(tasksResponse.data.tasks);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading dashboard..." />;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  return (
    <div className="dashboard-page">
      {/* Header Section */}
      <section className="dashboard-header">
        <Container>
          <Row>
            <Col>
              <h1 className="mb-2">
                {getGreeting()}, {user?.name}! 👋
              </h1>
              <p className="mb-0 opacity-75">
                Here's what's happening with your tasks today.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      <Container className="mt-4">
        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
            <Button 
              variant="outline-danger" 
              size="sm" 
              className="ms-2"
              onClick={fetchDashboardData}
            >
              Retry
            </Button>
          </Alert>
        )}

        {/* Statistics Cards */}
        <Row className="mb-4">
          <Col md={6} lg={3} className="mb-3">
            <Card className="stat-card border-start border-primary border-4">
              <Card.Body>
                <div className="stat-number text-primary">
                  {stats?.total || 0}
                </div>
                <div className="stat-label">Total Tasks</div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3} className="mb-3">
            <Card className="stat-card border-start border-success border-4">
              <Card.Body>
                <div className="stat-number text-success">
                  {stats?.completed || 0}
                </div>
                <div className="stat-label">Completed</div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3} className="mb-3">
            <Card className="stat-card border-start border-info border-4">
              <Card.Body>
                <div className="stat-number text-info">
                  {stats?.inProgress || 0}
                </div>
                <div className="stat-label">In Progress</div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3} className="mb-3">
            <Card className="stat-card border-start border-warning border-4">
              <Card.Body>
                <div className="stat-number text-warning">
                  {stats?.pending || 0}
                </div>
                <div className="stat-label">Pending</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Progress Overview */}
        {stats && (
          <Row className="mb-4">
            <Col lg={6}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">📊 Progress Overview</h5>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Completion Rate</span>
                      <span className="fw-bold">{stats.completionRate}%</span>
                    </div>
                    <div className="progress mb-3">
                      <div
                        className="progress-bar bg-success"
                        style={{ width: `${stats.completionRate}%` }}
                      />
                    </div>
                  </div>

                  <Row className="text-center">
                    <Col>
                      <div className="text-danger fw-bold">{stats.highPriority}</div>
                      <small className="text-muted">High Priority</small>
                    </Col>
                    <Col>
                      <div className="text-warning fw-bold">{stats.overdue || 0}</div>
                      <small className="text-muted">Overdue</small>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">🎯 Quick Actions</h5>
                </Card.Header>
                <Card.Body>
                  <div className="d-grid gap-2">
                    <Link to="/tasks" className="btn btn-primary">
                      📝 View All Tasks
                    </Link>
                    <Button 
                      variant="outline-primary"
                      onClick={() => window.location.href = '/tasks?action=new'}
                    >
                      ➕ Create New Task
                    </Button>
                    <Link to="/profile" className="btn btn-outline-secondary">
                      👤 Edit Profile
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Recent Tasks */}
        <Row>
          <Col>
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">📋 Recent Tasks</h5>
                <Link to="/tasks" className="btn btn-outline-primary btn-sm">
                  View All
                </Link>
              </Card.Header>
              <Card.Body>
                {recentTasks.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <h6>No tasks yet</h6>
                    <p>Create your first task to get started!</p>
                    <Link to="/tasks" className="btn btn-primary">
                      Create Task
                    </Link>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {recentTasks.map((task) => (
                      <div
                        key={task._id}
                        className="list-group-item border-0 px-0 py-3"
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <h6 className="mb-1">{task.title}</h6>
                            {task.description && (
                              <p className="mb-2 text-muted small">
                                {task.description.length > 100
                                  ? `${task.description.substring(0, 100)}...`
                                  : task.description
                                }
                              </p>
                            )}
                            <div className="d-flex gap-2 align-items-center">
                              <span className={`badge bg-${getStatusVariant(task.status)}`}>
                                {task.status}
                              </span>
                              <span className={`badge bg-${getPriorityVariant(task.priority)}`}>
                                {task.priority}
                              </span>
                              <small className="text-muted">
                                Created: {formatDate(task.createdAt)}
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard;