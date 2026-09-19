import { useNavigate } from 'react-router-dom';
import apiRequest from '../api/Services/Api';
import { useAuth } from '../auth/AuthContext';
import ToolForm from '../components/ToolForm';

export default function NewTool() {
  const { token } = useAuth();
  const navigate = useNavigate();

  // ToolForm hands back a plain object of the validated field values.
  // This is where that turns into an actual POST /tools call.
  const createTool = async (values) => {
    const tool = await apiRequest('/tools', token, {
      method: 'POST',
      body: JSON.stringify(values),
    });

    // Land on the tool's own detail page — from here, visiting Browse
    // will show it too, since it's a real row in the database now.
    navigate(`/tools/${tool.id}`);
  };

  return (
    <>
      <h1>List a tool</h1>
      <ToolForm onSubmit={createTool} submitLabel="List tool" />
    </>
  );
}