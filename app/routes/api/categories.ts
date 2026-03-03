import { getDb } from '~/lib/db/mongodb';

interface CategoryDoc {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  category_path: string;
  url: string;
  image: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  description: string | null;
  footer_description: string | null;
  google_product_category: string;
  active: boolean;
}

interface CategoryNode extends CategoryDoc {
  children: CategoryNode[];
}

function buildTree(docs: CategoryDoc[]): CategoryNode[] {
  const map = new Map<number, CategoryNode>();
  const roots: CategoryNode[] = [];

  docs.forEach((doc) => {
    map.set(doc.id, { ...doc, children: [] });
  });

  map.forEach((node) => {
    if (node.parent_id === null) {
      roots.push(node);
    } else {
      const parent = map.get(node.parent_id);
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node); // orphan: treat as root
      }
    }
  });

  return roots;
}

export async function loader({ context }: { request: Request; context: Record<string, unknown> }) {
  const env = (context.cloudflare?.env ?? context.env) as { MONGODB_URI: string; MONGODB_DB?: string };
  const db = await getDb(env);

  const docs = await db
    .collection<CategoryDoc>('categories')
    .find({ active: true })
    .sort({ id: 1 })
    .toArray();

  const tree = buildTree(docs);

  return new Response(JSON.stringify(tree), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
