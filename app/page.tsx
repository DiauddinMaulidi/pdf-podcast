import Login from "@/components/login/page"

const Home = () => {
  return (
    <div className="bg-linear-to-b from-[#170029] via-purple-800 to-[#170029] to-90% h-screen w-full">
      <div className="bg-transparent h-20 flex justify-center items-center">
        <i className="font-bold text-[40px] z-1000 text-white">PDFPOD</i>
      </div>
      <div className="p-2 -mt-[25%] text-center relative">
        <div className="w-[50%] h-screen p-4 rounded-full inline-flex flex-col items-center justify-center bg-linear-to-b from-transparent via-transparent to-[#170029] text-gray-700 text-xl ">
          <div>
            <p className="text-[40px] mt-50 font-bold text-white">Learn by Listening,<br />Not Reading</p>
            <p className="text-[15px] mt-5 text-white">Dengan bantuan AI, dokument PDF kamu kini bisa berubah<br /> menjadi podcast informatif dan interaktif.</p>
          </div>
            <div className="flex items-end -mt-15 h-full absolute">
              <Login />
            </div>
        </div>
      </div>
      <div className="fixed w-full flex justify-center">
        <img src="informatics2.jpg" alt="informatics" className="rounded-xl" />
      </div>
    </div>
  )
}

export default Home
