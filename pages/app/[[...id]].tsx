import { FC, useState } from 'react'
import { Pane, Dialog, majorScale } from 'evergreen-ui'
import { useRouter } from 'next/router'
import { getSession, useSession } from 'next-auth/client'
import Logo from '../../components/logo'
import FolderList from '../../components/folderList'
import NewFolderButton from '../../components/newFolderButton'
import User from '../../components/user'
import FolderPane from '../../components/folderPane'
import DocPane from '../../components/docPane'
import NewFolderDialog from '../../components/newFolderDialog'
import { connectToDB, folder, doc } from '../../db'

const App: FC<{
	folders?: any[]
	activeFolder?: any
	activeDoc?: any
	activeDocs?: any[]
}> = ({ folders, activeDoc, activeFolder, activeDocs }) => {
	const router = useRouter()
	const [newFolderIsShown, setIsShown] = useState(false)
	const [session, loading] = useSession()
	const [allFolders, setFolders] = useState(folders || [])

	if (loading) return null

	const handleNewFolder = async (name: string) => {
		const res = await fetch(
			`${process.env.NEXT_PUBLIC_API_HOST}/api/folder/`,
			{
				method: 'POST',
				body: JSON.stringify({ name }),
				headers: {
					'Content-Type': 'application/json',
				},
			}
		)

		const { data } = await res.json()

		// create a new state that merges the initialized state ({folders}, from the server) and the state that we got from the API above, and because it depends on the previous state (to actually get ALL the folders), we'll have to use the callback function
		setFolders((state) => [...state, data])
	}

	const Page = () => {
		if (activeDoc) {
			return <DocPane folder={activeFolder} doc={activeDoc} />
		}

		if (activeFolder) {
			return <FolderPane folder={activeFolder} docs={activeDocs} />
		}

		return null
	}

	if (!loading && !session) {
		return (
			<Dialog
				isShown
				title="Session expired"
				confirmLabel="Ok"
				hasCancel={false}
				hasClose={false}
				shouldCloseOnOverlayClick={false}
				shouldCloseOnEscapePress={false}
				onConfirm={() => router.push('/signin')}
			>
				Sign in to continue
			</Dialog>
		)
	}

	return (
		<Pane position="relative">
			<Pane
				width={300}
				position="absolute"
				top={0}
				left={0}
				background="tint2"
				height="100vh"
				borderRight
			>
				<Pane
					padding={majorScale(2)}
					display="flex"
					alignItems="center"
					justifyContent="space-between"
				>
					<Logo />

					<NewFolderButton onClick={() => setIsShown(true)} />
				</Pane>
				<Pane>
					<FolderList folders={allFolders} />{' '}
				</Pane>
			</Pane>
			<Pane
				marginLeft={300}
				width="calc(100vw - 300px)"
				height="100vh"
				overflowY="auto"
				position="relative"
			>
				<User user={session.user} />
				<Page />
			</Pane>
			<NewFolderDialog
				close={() => setIsShown(false)}
				isShown={newFolderIsShown}
				onNewFolder={handleNewFolder}
			/>
		</Pane>
	)
}

App.defaultProps = {
	folders: [],
}

/** 
  use getServerSideProps() coz this page is "dynamic": fetch the "data" initially on the server, then we'll handle mutations from the client
  {context} is like a {req, res} object
  And the page WAITS for this function to done its execution THEN it'll render, i.e. this function is ALWAYS be executed whenever we hit this '/app' route
 */
export async function getServerSideProps(context) {
	const session = await getSession(context)
	if (!session || !session.user) {
		return { props: {} }
	}

	const props: any = { session }
	const { db } = await connectToDB()
	const folders = await folder.getFolders(db, session.user.id)
	props.folders = folders

	if (context.params.id) {
		const activeFolder = folders.find((f) => f._id === context.params.id[0])
		const activeDocs = await doc.getDocsByFolder(db, activeFolder._id)
		props.activeFolder = activeFolder
		props.activeDocs = activeDocs

		const activeDocId = context.params.id[1] // [1] coz it's getting the the path to the doc, which follows the path of the folder i.e. /app/folder_id is context.params.id[0] and /app/folder_id/document_1 is context.params.id[1]

		if (activeDocId) {
			props.activeDoc = await doc.getOneDoc(db, activeDocId)
		}
	}

	return {
		props,
	}
}

/**
 * Catch all handler. Must handle all different page states:
 * 1. Folders - none selected: i.e. navigate to '/app'
 * 2. Folders => Folder selected: i.e. navigate to '/app/folder_id', showing the documents of that folder
 * 3. Folders => Folder selected => Document selected: i.e. navigate to '/app/folder_id/document_1', showing the SELECTED document of that folder
 *
 * An unauth user should NOT be able to access this page.
 * @param context
 */
export default App
