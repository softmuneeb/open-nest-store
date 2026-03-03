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
      <ol style={{ display: 'flex', listStyle: 'none', padding: 0, margin: 0, flexWrap: 'wrap', gap: '0.25rem' }}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.href} style={{ display: 'flex', alignItems: 'center' }}>
              {index > 0 && (
                <span aria-hidden="true" style={{ marginRight: '0.25rem' }}>
                  /
                </span>
              )}
              {isLast ? (
                <span aria-current="page">{item.name}</span>
              ) : (
                <a href={item.href}>{item.name}</a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
