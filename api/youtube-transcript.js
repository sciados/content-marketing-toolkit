// Test if your serverless function exists and works
fetch('/api/transcript?videoId=dQw4w9WgXcQ')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);