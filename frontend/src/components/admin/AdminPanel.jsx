import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Tab, Tabs, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { useAuth } from '../auth/AuthContext';
import BlogEditor from './BlogEditor';
import ServiceEditor from './ServiceEditor';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';

const BASE_URL = 'http://localhost:3000';

export default function AdminPanel() {
  const { user, token } = useAuth();
  const [tab, setTab] = useState(0);
  const [services, setServices] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [blogEditorOpen, setBlogEditorOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [serviceEditorOpen, setServiceEditorOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [vacancies, setVacancies] = useState([]);
  const [vacancyLoading, setVacancyLoading] = useState(false);
  const [vacancyError, setVacancyError] = useState('');
  const [vacancyEditorOpen, setVacancyEditorOpen] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState(null);
  const [applications, setApplications] = useState([]);
  const [appLoading, setAppLoading] = useState(false);
  const [subscribers, setSubscribers] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    setLoading(true);
    Promise.all([
      fetch(BASE_URL + '/v1/api/services').then(r => r.json()),
      fetch(BASE_URL + '/v1/api/join').then(r => r.json()),
      fetch(BASE_URL + '/v1/api/admin/users', {
        headers: { Authorization: 'Bearer ' + token }
      }).then(r => r.json()),
      fetch(BASE_URL + '/v1/api/blogs').then(r => r.json()),
      fetch(BASE_URL + '/v1/api/services/enrollments', {
        headers: { Authorization: 'Bearer ' + token }
      }).then(r => r.json()),
      fetch(BASE_URL + '/v1/api/vacancy').then(r => r.json()),
      fetch(BASE_URL + '/v1/api/vacancy/applications/all', {
        headers: { Authorization: 'Bearer ' + token }
      }).then(r => r.json()),
      fetch(BASE_URL + '/v1/api/admin/subscribers', {
        headers: { Authorization: 'Bearer ' + token }
      }).then(r => r.json()),
    ]).then(([
      servicesRes, joinRes, usersRes, blogsRes, enrollmentsRes, vacanciesRes, applicationsRes, subscribersRes
    ]) => {
      setServices(servicesRes.services || servicesRes || []);
      setJoinRequests(joinRes.requests || joinRes || []);
      setUsers(Array.isArray(usersRes.users) ? usersRes.users : []);
      setBlogs(Array.isArray(blogsRes) ? blogsRes : []);
      setEnrollments(Array.isArray(enrollmentsRes) ? enrollmentsRes : []);
      setVacancies(Array.isArray(vacanciesRes) ? vacanciesRes : []);
      setApplications(Array.isArray(applicationsRes) ? applicationsRes : []);
      setSubscribers(Array.isArray(subscribersRes) ? subscribersRes : []);
      setLoading(false);
    }).catch(() => {
      setError('Failed to load admin data');
      setLoading(false);
    });
  }, [user, token]);

  const handleAddService = () => {
    setEditingService(null);
    setServiceEditorOpen(true);
  };
  const handleEditService = (service) => {
    setEditingService(service);
    setServiceEditorOpen(true);
  };
  const handleDeleteService = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    await fetch(BASE_URL + '/v1/api/services/' + id, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + token }
    });
    setServices(services.filter(s => s._id !== id));
  };
  const handleSaveService = async (data) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('category', data.category);
    formData.append('items', data.items.join(','));
    if (data.image) formData.append('image', data.image);

    let res, updated;
    if (editingService) {
      res = await fetch(BASE_URL + '/v1/api/services/' + editingService._id, {
        method: 'PUT',
        headers: { Authorization: 'Bearer ' + token },
        body: formData
      });
      updated = await res.json();
      setServices(services.map(s => s._id === updated._id ? updated : s));
    } else {
      res = await fetch(BASE_URL + '/v1/api/services', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
        body: formData
      });
      updated = await res.json();
      setServices([updated, ...services]);
    }
    setServiceEditorOpen(false);
    setEditingService(null);
  };

  // Blog CRUD handlers
  const handleAddBlog = () => {
    setEditingBlog(null);
    setBlogEditorOpen(true);
  };
  const handleEditBlog = (blog) => {
    setEditingBlog(blog);
    setBlogEditorOpen(true);
  };
  const handleDeleteBlog = async (id) => {
    if (!window.confirm('Delete this blog?')) return;
    await fetch(BASE_URL + '/v1/api/blogs/' + id, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + token }
    });
    setBlogs(blogs.filter(b => b._id !== id));
  };
  const handleSaveBlog = async (data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    formData.append('author', data.author);
    if (data.thumbnail) formData.append('thumbnail', data.thumbnail);

    if (editingBlog) {
      // Edit
      const res = await fetch(BASE_URL + '/v1/api/blogs/' + editingBlog._id, {
        method: 'PUT',
        headers: { Authorization: 'Bearer ' + token },
        body: formData
      });
      const updated = await res.json();
      setBlogs(blogs.map(b => b._id === updated._id ? updated : b));
    } else {
      // Add
      const res = await fetch(BASE_URL + '/v1/api/blogs', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
        body: formData
      });
      const created = await res.json();
      setBlogs([created, ...blogs]);
    }
    setBlogEditorOpen(false);
    setEditingBlog(null);
  };

  // Vacancy CRUD handlers
  const handleAddVacancy = () => {
    setEditingVacancy(null);
    setVacancyEditorOpen(true);
  };
  const handleEditVacancy = (vac) => {
    setEditingVacancy(vac);
    setVacancyEditorOpen(true);
  };
  const handleDeleteVacancy = async (id) => {
    if (!window.confirm('Delete this vacancy?')) return;
    await fetch(BASE_URL + '/v1/api/vacancy/' + id, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + token }
    });
    setVacancies(vacancies.filter(v => v._id !== id));
  };
  const handleSaveVacancy = async (data) => {
    setVacancyLoading(true);
    setVacancyError('');
    let res, updated;
    if (editingVacancy) {
      res = await fetch(BASE_URL + '/v1/api/vacancy/' + editingVacancy._id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(data)
      });
      updated = await res.json();
      setVacancies(vacancies.map(v => v._id === updated._id ? updated : v));
    } else {
      res = await fetch(BASE_URL + '/v1/api/vacancy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(data)
      });
      updated = await res.json();
      setVacancies([updated, ...vacancies]);
    }
    setVacancyLoading(false);
    setVacancyEditorOpen(false);
    setEditingVacancy(null);
  };

  // VacancyEditor component (inline)
  function VacancyEditor({ open, onClose, onSave, initialData }) {
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [location, setLocation] = useState(initialData?.location || '');
    const [type, setType] = useState(initialData?.type || 'Full-time');
    const [deadline, setDeadline] = useState(initialData?.deadline ? new Date(initialData.deadline).toISOString().slice(0, 10) : '');
    useEffect(() => {
      setTitle(initialData?.title || '');
      setDescription(initialData?.description || '');
      setLocation(initialData?.location || '');
      setType(initialData?.type || 'Full-time');
      setDeadline(initialData?.deadline ? new Date(initialData.deadline).toISOString().slice(0, 10) : '');
    }, [initialData, open]);
    const handleSave = () => {
      if (title && description && location && type && deadline) {
        onSave({ title, description, location, type, deadline });
      }
    };
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{initialData ? 'Edit Vacancy' : 'Add Vacancy'}</DialogTitle>
        <DialogContent>
          <TextField label="Title" value={title} onChange={e => setTitle(e.target.value)} fullWidth sx={{ mb: 2 }} required />
          <TextField label="Description" value={description} onChange={e => setDescription(e.target.value)} fullWidth sx={{ mb: 2 }} required multiline minRows={2} />
          <TextField label="Location" value={location} onChange={e => setLocation(e.target.value)} fullWidth sx={{ mb: 2 }} required />
          <Select value={type} onChange={e => setType(e.target.value)} fullWidth sx={{ mb: 2 }} required>
            <MenuItem value="Full-time">Full-time</MenuItem>
            <MenuItem value="Part-time">Part-time</MenuItem>
            <MenuItem value="Internship">Internship</MenuItem>
          </Select>
          <TextField label="Deadline" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} fullWidth sx={{ mb: 2 }} required InputLabelProps={{ shrink: true }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!title || !description || !location || !type || !deadline}>Save</Button>
        </DialogActions>
      </Dialog>
    );
  }

  if (!user) {
    return <Alert severity="error" sx={{ mt: 4 }}>Access Denied</Alert>;
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 6, p: 3 }}>
      <Typography variant="h4" fontWeight={700} mb={3}>Admin Panel</Typography>
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}
          variant="scrollable" scrollButtons="auto"
        >
          <Tab label="Users" />
          <Tab label="Services" />
          <Tab label="Join Requests" />
          <Tab label="Blogs" />
          <Tab label="Enrollments" />
          <Tab label="Vacancies" />
          <Tab label="Vacancy Applications" />
          <Tab label="Subscribers" />
        </Tabs>
      </Paper>
      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        tab === 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(users) ? users.map(u => (
                  <TableRow key={u._id}>
                    <TableCell>{u.username || u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.role}</TableCell>
                  </TableRow>
                )) : null}
              </TableBody>
            </Table>
          </TableContainer>
        ) : tab === 1 ? (
          <Box>
            <Button variant="contained" sx={{ mb: 2 }} onClick={handleAddService}>Add Service</Button>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {services.map(service => (
                    <TableRow key={service._id}>
                      <TableCell>{service.name}</TableCell>
                      <TableCell>{service.description}</TableCell>
                      <TableCell>{service.category}</TableCell>
                      <TableCell>{Array.isArray(service.items) ? service.items.join(', ') : ''}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEditService(service)}><EditIcon /></IconButton>
                        <IconButton onClick={() => handleDeleteService(service._id)} color="error"><DeleteIcon /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <ServiceEditor
              open={serviceEditorOpen}
              onClose={() => { setServiceEditorOpen(false); setEditingService(null); }}
              onSave={handleSaveService}
              initialData={editingService}
            />
          </Box>
        ) : tab === 2 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Message</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {joinRequests.map(r => (
                  <TableRow key={r._id}>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.email}</TableCell>
                    <TableCell>{r.phone}</TableCell>
                    <TableCell>{r.message}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : tab === 3 ? (
          <Box>
            <Button variant="contained" sx={{ mb: 2 }} onClick={handleAddBlog}>Add Blog</Button>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Author</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {blogs.map(blog => (
                    <TableRow key={blog._id}>
                      <TableCell>{blog.title}</TableCell>
                      <TableCell>{blog.author}</TableCell>
                      <TableCell>{new Date(blog.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEditBlog(blog)}><EditIcon /></IconButton>
                        <IconButton onClick={() => handleDeleteBlog(blog._id)} color="error"><DeleteIcon /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <BlogEditor
              open={blogEditorOpen}
              onClose={() => { setBlogEditorOpen(false); setEditingBlog(null); }}
              onSave={handleSaveBlog}
              initialData={editingBlog}
            />
          </Box>
        ) : tab === 4 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Service</TableCell>
                  <TableCell>User Type</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Company Type</TableCell>
                  <TableCell>Company Name</TableCell>
                  <TableCell>Employees</TableCell>
                  <TableCell>Turnover</TableCell>
                  <TableCell>Profession</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {enrollments.map(e => (
                  <TableRow key={e._id}>
                    <TableCell>{e.serviceName}</TableCell>
                    <TableCell>{e.userType}</TableCell>
                    <TableCell>{e.name}</TableCell>
                    <TableCell>{e.email}</TableCell>
                    <TableCell>{e.phone}</TableCell>
                    <TableCell>{e.companyType}</TableCell>
                    <TableCell>{e.companyName}</TableCell>
                    <TableCell>{e.employees}</TableCell>
                    <TableCell>{e.turnover}</TableCell>
                    <TableCell>{e.profession}</TableCell>
                    <TableCell>{e.message}</TableCell>
                    <TableCell>
                      <Select
                        value={e.status}
                        size="small"
                        onChange={async (evt) => {
                          const newStatus = evt.target.value;
                          await fetch(BASE_URL + `/v1/api/services/enrollments/${e._id}/status`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
                            body: JSON.stringify({ status: newStatus })
                          });
                          setEnrollments(enrollments.map(en => en._id === e._id ? { ...en, status: newStatus } : en));
                        }}
                        sx={{ minWidth: 110 }}
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="reviewed">Reviewed</MenuItem>
                        <MenuItem value="accepted">Accepted</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>{new Date(e.createdAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : tab === 5 ? (
          <Box>
            <Button variant="contained" sx={{ mb: 2 }} onClick={handleAddVacancy}>Add Vacancy</Button>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Deadline</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vacancies.map(vac => (
                    <TableRow key={vac._id}>
                      <TableCell>{vac.title}</TableCell>
                      <TableCell>{vac.description}</TableCell>
                      <TableCell>{vac.location}</TableCell>
                      <TableCell>{vac.type}</TableCell>
                      <TableCell>{new Date(vac.deadline).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEditVacancy(vac)}><EditIcon /></IconButton>
                        <IconButton onClick={() => handleDeleteVacancy(vac._id)} color="error"><DeleteIcon /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <VacancyEditor
              open={vacancyEditorOpen}
              onClose={() => { setVacancyEditorOpen(false); setEditingVacancy(null); }}
              onSave={handleSaveVacancy}
              initialData={editingVacancy}
            />
          </Box>
        ) : tab === 6 ? (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Vacancy Applications</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Vacancy</TableCell>
                    <TableCell>Message</TableCell>
                    <TableCell>CV</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applications.map(app => (
                    <TableRow key={app._id}>
                      <TableCell>{app.name}</TableCell>
                      <TableCell>{app.email}</TableCell>
                      <TableCell>{app.phone}</TableCell>
                      <TableCell>{app.vacancyId?.title}</TableCell>
                      <TableCell>{app.message}</TableCell>
                      <TableCell>
                        <IconButton component="a" href={`http://localhost:3000/v1/api/drive/image/${app.cv}`} target="_blank" rel="noopener noreferrer">
                          <DownloadIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={app.status || 'pending'}
                          size="small"
                          onChange={async (evt) => {
                            const newStatus = evt.target.value;
                            await fetch(BASE_URL + `/v1/api/vacancy/applications/${app._id}/status`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
                              body: JSON.stringify({ status: newStatus })
                            });
                            setApplications(applications.map(a => a._id === app._id ? { ...a, status: newStatus } : a));
                          }}
                          sx={{ minWidth: 110 }}
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="reviewed">Reviewed</MenuItem>
                          <MenuItem value="accepted">Accepted</MenuItem>
                          <MenuItem value="rejected">Rejected</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell>{new Date(app.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ) : tab === 7 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Subscribed At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subscribers.map(sub => (
                  <TableRow key={sub._id}>
                    <TableCell>{sub.email}</TableCell>
                    <TableCell>{new Date(sub.createdAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Service</TableCell>
                  <TableCell>User Type</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Company Type</TableCell>
                  <TableCell>Company Name</TableCell>
                  <TableCell>Employees</TableCell>
                  <TableCell>Turnover</TableCell>
                  <TableCell>Profession</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {enrollments.map(e => (
                  <TableRow key={e._id}>
                    <TableCell>{e.serviceName}</TableCell>
                    <TableCell>{e.userType}</TableCell>
                    <TableCell>{e.name}</TableCell>
                    <TableCell>{e.email}</TableCell>
                    <TableCell>{e.phone}</TableCell>
                    <TableCell>{e.companyType}</TableCell>
                    <TableCell>{e.companyName}</TableCell>
                    <TableCell>{e.employees}</TableCell>
                    <TableCell>{e.turnover}</TableCell>
                    <TableCell>{e.profession}</TableCell>
                    <TableCell>{e.message}</TableCell>
                    <TableCell>
                      <Select
                        value={e.status}
                        size="small"
                        onChange={async (evt) => {
                          const newStatus = evt.target.value;
                          await fetch(BASE_URL + `/v1/api/services/enrollments/${e._id}/status`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
                            body: JSON.stringify({ status: newStatus })
                          });
                          setEnrollments(enrollments.map(en => en._id === e._id ? { ...en, status: newStatus } : en));
                        }}
                        sx={{ minWidth: 110 }}
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="reviewed">Reviewed</MenuItem>
                        <MenuItem value="accepted">Accepted</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>{new Date(e.createdAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      )}
    </Box>
  );
} 