import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Pages/AuthProvider'
import { useEffect } from 'react'
import { getInstructorById } from '../Api/instructor.api';

export const AdminRoute = ({ children }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  useEffect(() => {
    console.log(user);
    if (user.user === null) {
      navigate('/login')
    }
    else if (user.user.role !== 'admin') {
      navigate("/")
    }
  })
  return (
    children
  )
}

export const InstructorRoute = ({ children }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    if (user.user === null) {
      navigate('/login');
      return;
    }
    
    if (user.user.role !== 'instructor') {
      navigate("/");
      return;
    }
    
    if (user.user.instructor) {
      const checkStatus = async () => {
        try {
          const res = await getInstructorById(user.user.instructor);
          if (res.data.message.instructor[0].instructor.documentVerified === "pending") {
            navigate("/instructor/pending-review");
          }
        } catch (error) {
          console.error("Error checking instructor status:", error);
          // Don't redirect on error, just log it
        }
      };
      
      checkStatus();
    }
  }, [user.user, navigate]);
  
  return children;
}
