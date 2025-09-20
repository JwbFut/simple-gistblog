export default function Footer() {
    return (
        <footer className="my-5 text-center text-sm text-neutral-500">
            <p>© {new Date().getFullYear()} Jawbts. All Rights Reserved for blog content.</p>
            <p className="mt-1">
                Source code is open source (GNU GPL v3) —{' '}
                <a
                    href="https://github.com/jwbfut/simple-gistblog"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                >
                    View on GitHub
                </a>
            </p>
        </footer>
    );
}