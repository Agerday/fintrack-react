import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

function Section({
    label,
    title,
    children,
}: {
    label: string;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="border-t border-border pt-8">
            <div className="grid gap-6 md:grid-cols-[160px_1fr]">
                <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <h2 className="mt-1 font-medium text-foreground">{title}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-3">{children}</div>
            </div>
        </section>
    );
}

function Swatch({ name, className }: { name: string; className: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-md border border-border ${className}`} />
            <span className="text-sm text-muted-foreground">{name}</span>
        </div>
    );
}

export default function StyleGuidePage() {
    return (
        <div className="max-w-3xl space-y-8">
            <div>
                <p className="text-sm text-muted-foreground">Design reference</p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
                    Style Guide
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Shared tokens and components for Fintrack. Reuse these instead of reinventing
                    styles per feature.
                </p>
            </div>

            <Section label="Colors" title="Core palette">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <Swatch name="background" className="bg-background" />
                    <Swatch name="card" className="bg-card" />
                    <Swatch name="primary" className="bg-primary" />
                    <Swatch name="secondary" className="bg-secondary" />
                    <Swatch name="muted" className="bg-muted" />
                    <Swatch name="destructive" className="bg-destructive" />
                </div>
            </Section>

            <Section label="Colors" title="Status">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <Swatch name="status-paid" className="bg-status-paid" />
                    <Swatch name="status-pending" className="bg-status-pending" />
                    <Swatch name="overdue (destructive)" className="bg-destructive" />
                </div>
            </Section>

            <Section label="Typography" title="Scale">
                <div className="space-y-2">
                    <p className="text-3xl font-semibold tracking-tight">Heading 1</p>
                    <p className="text-xl font-semibold">Heading 2</p>
                    <p className="text-base text-foreground">Body text, default size.</p>
                    <p className="text-sm text-muted-foreground">Muted text, for secondary info.</p>
                    <p className="font-mono text-sm tabular-nums">
                        $12,480.00 — tabular numerals for amounts
                    </p>
                </div>
            </Section>

            <Section label="Actions" title="Buttons">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link</Button>
            </Section>

            <Section label="Actions" title="Sizes">
                <Button size="xs">Extra small</Button>
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
            </Section>

            <Section label="Status" title="Badges">
                <Badge className="bg-status-paid text-status-paid-foreground">Paid</Badge>
                <Badge className="bg-status-pending text-status-pending-foreground">Pending</Badge>
                <Badge variant="destructive">Overdue</Badge>
                <Badge variant="outline">Outline</Badge>
            </Section>

            <Section label="Forms" title="Inputs">
                <div className="w-full max-w-sm space-y-3">
                    <div className="space-y-1.5">
                        <Label htmlFor="demo-input">Label</Label>
                        <Input id="demo-input" placeholder="Placeholder..." />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="demo-textarea">Textarea</Label>
                        <Textarea id="demo-textarea" placeholder="Placeholder..." />
                    </div>
                </div>
            </Section>

            <Section label="Layout" title="Card">
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle>Card title</CardTitle>
                        <CardDescription>Card description text.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Card content.</p>
                    </CardContent>
                    <CardFooter>
                        <Button size="sm">Action</Button>
                    </CardFooter>
                </Card>
            </Section>
        </div>
    );
}
