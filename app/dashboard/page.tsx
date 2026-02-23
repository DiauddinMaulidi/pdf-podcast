import FileUpload from "@/components/fileUpload"
import { ResizablePanel } from "@/components/ui/resizable"

const Dashboard = () => {
  return (
    <ResizablePanel defaultSize={85} minSize={10} className="h-full grid place-items-center bg-white dark:bg-[#22262b]">
      <div className="p-2 rounded-lg border-2 border-purple-800">
        <FileUpload />
      </div>
    </ResizablePanel>
  )
}

export default Dashboard