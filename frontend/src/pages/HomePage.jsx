import {useAuth} from '../context/AuthContext'
function HomePage(){
  const data = useAuth()
  console.log(data);
  return (
    <div>Home Page</div>
  )
}

export default HomePage