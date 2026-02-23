"use client"

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Inbox } from 'lucide-react'
import {useDropzone} from 'react-dropzone'

const FileUpload = () => {
    const queryClient = useQueryClient()
    const {getRootProps, getInputProps} = useDropzone({
        accept: {
            "application/pdf": [".pdf"],
        },
        maxFiles: 1,
        onDrop: (file) => {
            mutation.mutate(file[0])
        }
    })

    const mutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData()
            formData.append("file", file)
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData
            })
            if(!res.ok) {
                throw new Error("Failed to upload file")
            }
            return await res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["chats"]})
            console.log("file uploaded successfully")
        },
        onError: () => {
            console.log("file uploaded error")
        }
    })

    return (
        <div {...getRootProps()} className='bg-purple-800 flex flex-col cursor-pointer items-center justify-center rounded-lg py-4 px-8'>
            <input {...getInputProps()} accept='application/pdf' />
            <>
                <Inbox className='w-10 h-10 text-white dark:text-[#22262b]' />
                <p className='text-sm text-amber-500 dark:text-white'>Drop PDF here</p>
            </>
        </div>
    )
}

export default FileUpload
