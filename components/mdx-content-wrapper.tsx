"use client";

import dynamic from 'next/dynamic';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';

const MDXContent = dynamic(() => import('@/components/mdx-content'), {
  ssr: false,
});

interface MDXContentWrapperProps {
  source: MDXRemoteSerializeResult;
}

export default function MDXContentWrapper({ source }: MDXContentWrapperProps) {
  return <MDXContent source={source} />;
}
