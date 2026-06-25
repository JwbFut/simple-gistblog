import 'server-only';

async function fetchImage(src: string | Blob) {
    let arrayBuffer: ArrayBuffer, contentType: string;
    if (src instanceof Blob) {
        arrayBuffer = await src.arrayBuffer();
        contentType = src.type;
    } else {
        const response = await fetch(src);
        const blob = await response.blob();
        arrayBuffer = await blob.arrayBuffer();
        contentType = blob.type;
    }

    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    return `data:${contentType};base64,${base64}`;
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
        data = await fetchImage(src);
    } catch (e: unknown) {
        if (process.env.NODE_ENV === "development") console.error("AsyncProxiedImage, fetchImage", e);
        return <img src={src instanceof Blob ? URL.createObjectURL(src) : src} alt={alt} {...props} />;
    }

    return <img src={data} alt={alt} {...props} />;
};