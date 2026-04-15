import { generateStaticParamsFor, importPage } from "nextra/pages";
import { useMDXComponents as getMDXComponents } from "../../mdx-components";

interface PageProps {
  params: Promise<{ mdxPath: string[] }>;
}

export const generateStaticParams = generateStaticParamsFor("mdxPath");

export const generateMetadata = async (props: PageProps) => {
  const resolvedParams = await props.params;
  const { metadata } = await importPage(resolvedParams.mdxPath || []);
  return metadata;
};

const Wrapper = getMDXComponents().wrapper;

const Page = async ({ params }: { params: Promise<{ mdxPath: string[] }> }) => {
  const resolvedParams = await params;
  const { mdxPath } = resolvedParams;

  const {
    default: MDXContent,
    toc,
    metadata,
    sourceCode,
  } = await importPage(mdxPath || []);

  return (
    <Wrapper toc={toc} metadata={metadata} sourceCode={sourceCode}>
      <MDXContent params={resolvedParams} />
    </Wrapper>
  );
};

export default Page;
