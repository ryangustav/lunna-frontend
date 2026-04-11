import Image from "next/image";
import '@/src/styles/globals.css';

export default function AdminFakePage() {
    const gif = "/gif/rickroll.gif";
    return (
        <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
            <h1 className="text-2xl font-bold">Admin Page</h1>
            <p className="text-gray-400">This is a fake admin page</p>
            <Image
                className="gif rounded-lg shadow-xl"
                src={gif}
                alt="Gif"
                width={400}
                height={400}
                unoptimized
            />
        </div>
    );
}
