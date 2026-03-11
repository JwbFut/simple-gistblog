export default function Footer() {
    let buildHash = process.env.VERCEL_GIT_COMMIT_SHA;
    if (buildHash === undefined) {
        buildHash = 'unknown';
    } else {
        buildHash = buildHash.substring(0, 7);
    }

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
                {' '}Build hash {buildHash}
            </p>
        </footer>
    );
}