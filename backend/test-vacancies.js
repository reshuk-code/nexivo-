const mongoose = require('mongoose');
const Vacancy = require('./models/Vacancy');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/nexivo', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Sample vacancy data
const sampleVacancies = [
  {
    title: 'Frontend Developer',
    description: 'We are looking for a skilled Frontend Developer to join our team. You will be responsible for building user-friendly web applications using React, JavaScript, and modern web technologies.',
    location: 'Kathmandu, Nepal',
    type: 'Full-time',
    deadline: new Date('2024-12-31')
  },
  {
    title: 'Backend Developer',
    description: 'Join our backend team to develop robust server-side applications. Experience with Node.js, Express, MongoDB, and RESTful APIs is required.',
    location: 'Remote',
    type: 'Full-time',
    deadline: new Date('2024-12-15')
  },
  {
    title: 'UI/UX Designer',
    description: 'Creative UI/UX Designer needed to design beautiful and intuitive user interfaces. Experience with Figma, Adobe Creative Suite, and user research is preferred.',
    location: 'Kathmandu, Nepal',
    type: 'Part-time',
    deadline: new Date('2024-11-30')
  },
  {
    title: 'Software Engineering Intern',
    description: 'Great opportunity for students to gain real-world experience in software development. Work on exciting projects and learn from experienced developers.',
    location: 'Kathmandu, Nepal',
    type: 'Internship',
    deadline: new Date('2024-10-31')
  },
  {
    title: 'DevOps Engineer',
    description: 'Help us build and maintain our cloud infrastructure. Experience with AWS, Docker, Kubernetes, and CI/CD pipelines is required.',
    location: 'Remote',
    type: 'Full-time',
    deadline: new Date('2024-12-20')
  }
];

// Function to add vacancies
async function addVacancies() {
  try {
    // Clear existing vacancies
    await Vacancy.deleteMany({});
    console.log('Cleared existing vacancies');
    
    // Add new vacancies
    const vacancies = await Vacancy.insertMany(sampleVacancies);
    console.log(`Added ${vacancies.length} vacancies successfully`);
    
    // Display added vacancies
    vacancies.forEach(vacancy => {
      console.log(`- ${vacancy.title} (${vacancy.type})`);
    });
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error adding vacancies:', error);
    mongoose.connection.close();
  }
}

// Run the function
addVacancies(); 