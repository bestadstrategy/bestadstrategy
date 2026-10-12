import { WhopApp } from "@whop/react/components";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <WhopApp>{children}</WhopApp>;
}
