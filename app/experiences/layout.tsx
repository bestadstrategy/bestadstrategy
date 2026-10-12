import { WhopApp } from "@whop/react/components";

export default function ExperiencesLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <WhopApp>{children}</WhopApp>;
}
