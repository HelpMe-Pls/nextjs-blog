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

const App: FC<{
	folders?: any[]
	activeFolder?: any
	activeDoc?: any
	activeDocs?: any[]
}> = ({ folders, activeDoc, activeFolder, activeDocs }) => {
	const router = useRouter()
	const [newFolderIsShown, setIsShown] = useState(false)
	const [session, loading] = useSession()

	if (loading) return null

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
					<FolderList folders={[{ _id: 1, name: 'yep' }]} />{' '}
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
				onNewFolder={() => {}}
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
	return {
		props: { session },
	}
}

/**
 * Catch all handler. Must handle all different page
 * states.
 * 1. Folders - none selected
 * 2. Folders => Folder selected
 * 3. Folders => Folder selected => Document selected
 *
 * An unauth user should not be able to access this page.
 *
 * @param context
 */
export default App
