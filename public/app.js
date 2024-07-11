document.getElementById('resumeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
      fullName: document.getElementById('fullName').value,
      email: document.getElementById('email').value,
      phoneNumber: document.getElementById('phoneNumber').value,
      education: document.getElementById('education').value,
      experience: document.getElementById('experience').value
    };
  
    try {
      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      alert('Resume created and sent to your email!');
      document.getElementById('resumeForm').reset();
      loadResumes();
    } catch (error) {
      console.error('Error:', error);
    }
  });
  
  async function loadResumes() {
    try {
      const response = await fetch('/api/resumes');
      const resumes = await response.json();
      const resumeList = document.getElementById('resumeList');
      resumeList.innerHTML = '';
      resumes.forEach(resume => {
        const resumeElement = document.createElement('div');
        resumeElement.innerHTML = `
          <h3>${resume.fullName}</h3>
          <p>Email: ${resume.email}</p>
          <p>Phone: ${resume.phoneNumber}</p>
          <button onclick="viewResume('${resume._id}')">View</button>
        `;
        resumeList.appendChild(resumeElement);
      });
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  async function viewResume(id) {
    try {
      const response = await fetch(`/api/resumes/${id}`);
      const resume = await response.json();
      const resumeDetail = `
        <h2>${resume.fullName}'s Resume</h2>
        <p><strong>Email:</strong> ${resume.email}</p>
        <p><strong>Phone:</strong> ${resume.phoneNumber}</p>
        <h3>Education</h3>
        <p>${resume.education}</p>
        <h3>Experience</h3>
        <p>${resume.experience}</p>
      `;
      document.getElementById('resumeList').innerHTML = resumeDetail;
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  loadResumes();