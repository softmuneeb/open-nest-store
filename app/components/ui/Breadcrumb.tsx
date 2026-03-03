export interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="breadcrumb">
      <ol className="flex flex-wrap gap-1 list-none p-0 m-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.href} className="flex items-center">
              {index > 0 && (
                <span aria-hidden="true" className="mx-1 text-gray-500">
                  /
                </span>
              )}
              {isLast ? (
                <span aria-current="page" className="text-gray-900 font-medium">{item.name}</span>
              ) : (
                <a href={item.href} className="text-blue-600 hover:text-blue-800 hover:underline">
                  {item.name}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
