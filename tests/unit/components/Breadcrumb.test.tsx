/**
 * UNIT TESTS — <Breadcrumb /> Component
 * RED: These will fail until app/components/ui/Breadcrumb.tsx is created.
 */
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Breadcrumb, type BreadcrumbItem } from '~/components/ui/Breadcrumb';

const items: BreadcrumbItem[] = [
  { name: 'Home', href: '/' },
  { name: 'Computer Components', href: '/computer-components' },
  { name: 'CPUs / Processors', href: '/computer-components/processors' },
];

describe('<Breadcrumb />', () => {
  test('renders "Home" as the first item', () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  test('renders all breadcrumb items', () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Computer Components')).toBeInTheDocument();
    expect(screen.getByText('CPUs / Processors')).toBeInTheDocument();
  });

  test('first item is a link with correct href', () => {
    render(<Breadcrumb items={items} />);
    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  test('middle items are links with correct hrefs', () => {
    render(<Breadcrumb items={items} />);
    const catLink = screen.getByRole('link', { name: 'Computer Components' });
    expect(catLink).toHaveAttribute('href', '/computer-components');
  });

  test('last item is NOT a link', () => {
    render(<Breadcrumb items={items} />);
    // "CPUs / Processors" is the last item — should not be an anchor
    const lastText = screen.getByText('CPUs / Processors');
    expect(lastText.tagName.toLowerCase()).not.toBe('a');
  });

  test('last item has aria-current="page"', () => {
    render(<Breadcrumb items={items} />);
    const lastItem = screen.getByText('CPUs / Processors');
    expect(lastItem).toHaveAttribute('aria-current', 'page');
  });

  test('renders nav element with aria-label "breadcrumb"', () => {
    render(<Breadcrumb items={items} />);
    const nav = screen.getByRole('navigation', { name: /breadcrumb/i });
    expect(nav).toBeInTheDocument();
  });

  test('renders only one item for a single-item breadcrumb', () => {
    render(<Breadcrumb items={[{ name: 'Home', href: '/' }]} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });

  test('renders separator between items', () => {
    render(<Breadcrumb items={items} />);
    // Separators rendered as aria-hidden spans — test that 2 separators exist for 3 items
    const separators = document.querySelectorAll('[aria-hidden="true"]');
    expect(separators.length).toBeGreaterThanOrEqual(2);
  });
});
