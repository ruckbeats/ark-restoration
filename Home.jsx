import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCxfSXCpx-ztZbtejNgTc-D18FFMviAB08",
  authDomain: "ark-restoration-app.firebaseapp.com",
  projectId: "ark-restoration-app",
  storageBucket: "ark-restoration-app.appspot.com",
  messagingSenderId: "1011907510400",
  appId: "1:1011907510400:web:a66f0418b94d7c992ea665"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const formSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  service: z.string().min(2),
  squareFeet: z.string().optional(),
  message: z.string().optional(),
  date: z.string().optional(),
  image: z.any().optional(),
});

export default function Home() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const [appointments, setAppointments] = useState([]);

  const onSubmit = async (data) => {
    try {
      let imageUrl = "";
      if (data.image && data.image[0]) {
        const imageRef = ref(storage, `uploads/${data.image[0].name}`);
        await uploadBytes(imageRef, data.image[0]);
        imageUrl = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, "requests"), {
        name: data.name,
        email: data.email,
        service: data.service,
        squareFeet: data.squareFeet || "",
        message: data.message || "",
        date: data.date || "",
        imageUrl,
        timestamp: new Date().toISOString(),
      });

      alert("Request submitted successfully!");
      fetchAppointments();
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("There was an error. Please try again.");
    }
  };

  const fetchAppointments = async () => {
    const querySnapshot = await getDocs(collection(db, "requests"));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setAppointments(data);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-6">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold tracking-tight text-center text-blue-900 mb-4"
      >
        ARK Restoration
      </motion.h1>
      <p className="text-blue-700 mb-6 text-center">Redeemed. Restored. Book your service now.</p>

      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" encType="multipart/form-data">
            <input {...register("name")} placeholder="Name" className="w-full p-2 border rounded" />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}

            <input {...register("email")} placeholder="Email" className="w-full p-2 border rounded" />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

            <input {...register("service")} placeholder="Service Type" className="w-full p-2 border rounded" />
            {errors.service && <p className="text-red-500 text-sm">{errors.service.message}</p>}

            <input {...register("squareFeet")} placeholder="Estimated Sq Ft (optional)" className="w-full p-2 border rounded" />

            <input type="date" {...register("date")} className="w-full p-2 border rounded" />

            <textarea {...register("message")} placeholder="Additional Info" className="w-full p-2 border rounded"></textarea>

            <input type="file" {...register("image")} className="w-full p-2 border rounded" />

            <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white">
              Submit Request
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-10 grid grid-cols-2 gap-4 w-full max-w-2xl">
        {[
          "Water Mitigation",
          "Air Duct Cleaning",
          "Carpet Cleaning",
          "Residential Cleaning",
          "Trash Bin Cleaning",
          "Grass Cutting",
          "Painting",
          "Haul-Offs",
          "Ask About It"
        ].map((service, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            className="p-4 bg-white rounded-xl shadow text-center text-blue-900 font-semibold border border-blue-200"
          >
            {service}
          </motion.div>
        ))}
      </div>

      <div className="mt-10 w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4 text-blue-900">Upcoming Appointments</h2>
        <ul className="space-y-4">
          {appointments.map((item) => (
            <li key={item.id} className="p-4 bg-white rounded shadow border border-blue-100">
              <p><strong>Name:</strong> {item.name}</p>
              <p><strong>Service:</strong> {item.service}</p>
              <p><strong>Date:</strong> {item.date || "TBD"}</p>
              {item.imageUrl && <img src={item.imageUrl} alt="Upload" className="mt-2 w-full rounded" />}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
