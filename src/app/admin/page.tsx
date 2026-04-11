import Image from "next/image";
import '@/src/styles/globals.css';

export default function AdminFakePage() {
    const gif = "/gif/rickroll.gif"
    return (
        <div>
            <h1>Admin Page</h1>
            <p>This is a fake admin page</p>
            <img
            className="gif"
            src={gif}
            alt="Gif"
            width={400}
            height={400}
            />
        </div>
    )
}
