'use client'
import Navbar from "./components/navbar";
import 'react-toastify/dist/ReactToastify.css'; 
import { useSession } from 'next-auth/react';

export default function Home() {

  const{ data: session} = useSession(); //ดึงข้อมูล session
  return (
    <div>
      <main>
        <Navbar session={session}/>
      </main>
     
    </div>
  );
}
