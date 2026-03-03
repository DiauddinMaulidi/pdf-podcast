"use client"

import FileUpload from "@/components/fileUpload"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"

const Dashboard = () => {
  const {data: datas = []} = useQuery({
      queryKey: ["chats"],
      queryFn: async () => {
        const res = await fetch("/api/list")
        return res.json()
      },
      placeholderData: [],
  })

  return (
    <div className='w-full min-h-screen bg-gray-300 dark:bg-[#15161a]'>
      <div className='mx-7 sm:mx-24 mb-5'>
        <div className='pt-8 pb-4'>
          <p className='text-2xl'>NOTEBOOK BARU</p>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4'>
          <div className='w-full h-52 p-2 rounded-xl border-2 border-purple-800'>
            <FileUpload />
          </div>
          {datas?.map((data: any) => {
            const date = new Date(data?.uploadedAt)
            const formatted = date.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })

            return (
              <Link key={data.id} href={`/dashboard/chat/${data.id}`} className='bg-[#3c4152] dark:bg-[#2c2c33] text-white shadow-lg w-full h-52 rounded-xl cursor-pointer relative'>
                <div className='absolute bottom-0 p-5 text-start'>
                  <p className='text-2xl'>{data.originalName}</p>
                  <p>{formatted}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Dashboard