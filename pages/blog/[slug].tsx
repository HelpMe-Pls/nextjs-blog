import React, { FC } from 'react'
import hydrate from 'next-mdx-remote/hydrate'
import { majorScale, Pane, Heading, Spinner } from 'evergreen-ui'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Post } from '../../types'
import Container from '../../components/container'
import HomeNav from '../../components/homeNav'
import path from 'path'
import fs from 'fs'
import matter from 'gray-matter'

const BlogPost: FC<Post> = ({ source, frontMatter }) => {
	const content = hydrate(source)
	const router = useRouter()

	// user requested a page that isn't statically rendered yet:
	if (router.isFallback) {
		return (
			<Pane width="100%" height="100%">
				<Spinner size={48} />
			</Pane>
		)
	}
	return (
		<Pane>
			<Head>
				<title>{`Known Blog | ${frontMatter.title}`}</title>
				<meta name="description" content={frontMatter.summary} />
			</Head>
			<header>
				<HomeNav />
			</header>
			<main>
				<Container>
					<Heading
						fontSize="clamp(2rem, 8vw, 6rem)"
						lineHeight="clamp(2rem, 8vw, 6rem)"
						marginY={majorScale(3)}
					>
						{frontMatter.title}
					</Heading>
					<Pane>{content}</Pane>
				</Container>
			</main>
		</Pane>
	)
}

BlogPost.defaultProps = {
	source: '',
	frontMatter: {
		title: 'default title',
		summary: 'summary',
		publishedOn: '',
	},
}

/**
 * Need to get the paths here
 * then the the correct post for the matching path
 * Posts can come from the fs or our CMS
 */
export async function getStaticPaths() {
	const postsDirectory = path.join(process.cwd(), 'posts')
	const filenames = fs.readdirSync(postsDirectory)
	const slugs = filenames.map((name) => {
		const filePath = path.join(postsDirectory, name)
		const file = fs.readFileSync(filePath, 'utf-8')
		const { data } = matter(file)
		return data
	})

	// don't get paths for cms posts, instead, let fallback handle it
	return {
		paths: slugs.map((item) => ({
			params: {
				slug: item.slug,
			},
		})),
		// https://nextjs.org/docs/api-reference/data-fetching/get-static-paths#fallback-false
		fallback: false,
	}
}

export default BlogPost
