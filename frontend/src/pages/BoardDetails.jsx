import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import Layout from '../components/Layout'

import './BoardDetails.css'


function BoardDetails() {

    const navigate = useNavigate()

    const { boardId } = useParams()

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')


    useEffect(() => {

        const accessToken =
            localStorage.getItem('access_token')

        if (!accessToken) {
            navigate('/login')
            return
        }

        // For now we are only checking that boardId exists.
        // We will connect the board API here next.

        if (!boardId) {

            setError('Board not found.')

            setLoading(false)

            return
        }

        setLoading(false)

    }, [boardId, navigate])


    if (loading) {

        return (

            <Layout
                activePage="boards"
                title="Board"
            >

                <section className="board-details-page">

                    <div className="board-details-loading">
                        Loading board...
                    </div>

                </section>

            </Layout>

        )
    }


    if (error) {

        return (

            <Layout
                activePage="boards"
                title="Board"
            >

                <section className="board-details-page">

                    <div className="board-details-error">
                        {error}
                    </div>

                    <button
                        onClick={() => navigate('/boards')}
                    >
                        Back to Boards
                    </button>

                </section>

            </Layout>

        )
    }


    return (

        <Layout
            activePage="boards"
            title="Board"
        >

            <section className="board-details-page">

                {/* HEADER */}

                <div className="board-details-header">

                    <div>

                        <span className="section-label">
                            BOARD
                        </span>

                        <h1>
                            Board #{boardId}
                        </h1>

                        <p>
                            Manage your lists and tasks.
                        </p>

                    </div>


                    <button
                        className="back-to-boards-button"
                        onClick={() => navigate('/boards')}
                    >
                        ← Back to Boards
                    </button>

                </div>


                {/* BOARD CONTENT */}

                <div className="board-details-content">

                    <div className="board-placeholder">

                        <h2>
                            Board Details
                        </h2>

                        <p>
                            This is Board #{boardId}.
                        </p>

                        <p>
                            Lists and tasks will be displayed here.
                        </p>

                    </div>

                </div>

            </section>

        </Layout>

    )
}

export default BoardDetails
