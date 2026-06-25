import 'server-only';

async function fetch_image(src: string | Blob) {
    let ab, content_type;
    if (src instanceof Blob) {
        ab = await src.arrayBuffer();
        content_type = src.type;
    } else {
        const response = await fetch(src);
        const blob = await response.blob();
        ab = await blob.arrayBuffer();
        content_type = blob.type;
    }

    const buffer = Buffer.from(ab);
    const base64 = buffer.toString("base64");
    return `data:${content_type};base64,${base64}`;
}

interface AsyncProxiedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src?: string | Blob;
    alt?: string;
}

export default async function AsyncProxiedImage({ src, alt, ...props }: AsyncProxiedImageProps) {
    // fallback, let native browser handle
    if (!src) return <img src={src} alt={alt} {...props} />;

    let data;
    try {
        data = await fetch_image(src);
    } catch (e: unknown) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('AsyncProxiedImage: failed to fetch/proxy image source', e);
        }
        return <img src={src} alt={alt} {...props} />;
    }

    return <img src={data} alt={alt} {...props} />;
};