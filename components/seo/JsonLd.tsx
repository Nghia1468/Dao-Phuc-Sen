// Component server-side đơn giản để nhúng JSON-LD vào trang.
// Dùng: <JsonLd data={productSchema(product)} />
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
