import React, { useState, useEffect } from "react";
import "./App.css";

// --- Theme Colors ---
const COLORS = {
  primary: "#1976d2",
  secondary: "#757575",
  accent: "#ffb300",
  boardBg: "#f8f9fa",
  cellBg: "#fff",
  cellBorder: "#e9ecef",
  text: "#212121",
};

const BOARD_SIZE = 3;
const INITIAL_BOARD = Array(BOARD_SIZE * BOARD_SIZE).fill(null);

// PUBLIC_INTERFACE
function App() {
  const [theme] = useState("light"); // always light for now
  const [board, setBoard] = useState([...INITIAL_BOARD]);
  const [xIsNext, setXIsNext] = useState(true);
  const [mode, setMode] = useState("user"); // "user" or "ai"
  const [status, setStatus] = useState("ongoing"); // "ongoing" | "draw" | "X" | "O"
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [startingPlayer, setStartingPlayer] = useState("X");

  // PUBLIC_INTERFACE
  function startNewGame(newMode = mode) {
    const nextStart = startingPlayer === "X" ? "O" : "X";
    setBoard([...INITIAL_BOARD]);
    setStatus("ongoing");
    setStartingPlayer(nextStart);
    setXIsNext(nextStart === "X");
    setMode(newMode);
  }

  // PUBLIC_INTERFACE
  function restartMatch() {
    setBoard([...INITIAL_BOARD]);
    setStatus("ongoing");
    setXIsNext(startingPlayer === "X");
  }

  // Game status computation
  useEffect(() => {
    const winner = calculateWinner(board);
    if (winner) {
      setStatus(winner);
      setScores((prev) => ({
        ...prev,
        [winner]: prev[winner] + 1,
      }));
    } else if (board.every(Boolean)) {
      setStatus("draw");
      setScores((prev) => ({
        ...prev,
        draws: prev.draws + 1,
      }));
    }
    // eslint-disable-next-line
  }, [board]);

  // AI move - basic: pick first empty cell (can improve to random/strategic)
  useEffect(() => {
    if (
      status === "ongoing" &&
      mode === "ai" &&
      !xIsNext // AI is O, always starts as O
    ) {
      const aiPlayer = "O";
      setTimeout(() => {
        const emptyIndices = board
          .map((cell, i) => (cell ? null : i))
          .filter((i) => i !== null);
        if (emptyIndices.length > 0) {
          const idx = aiMove(board, aiPlayer); // strategic or random
          handleCellClick(idx);
        }
      }, 450); // slight delay to look natural
    }
    // eslint-disable-next-line
  }, [board, xIsNext, status, mode]);

  // PUBLIC_INTERFACE
  function handleCellClick(idx) {
    if (board[idx] || status !== "ongoing") return;
    const newBoard = board.slice();
    newBoard[idx] = xIsNext ? "X" : "O";
    setBoard(newBoard);
    setXIsNext((prev) => !prev);
  }

  // PUBLIC_INTERFACE
  function changeMode(newMode) {
    startNewGame(newMode);
  }

  // PUBLIC_INTERFACE
  function playerIndicator(player) {
    const isActive =
      status === "ongoing"
        ? (xIsNext && player === "X") || (!xIsNext && player === "O")
        : false;
    const winnerHighlight = status === player;
    return (
      <span
        style={{
          padding: "0.3rem 1rem",
          margin: "0 0.6rem",
          borderRadius: "1rem",
          background: winnerHighlight
            ? COLORS.accent
            : isActive
            ? COLORS.primary
            : "#e0e0e0",
          color: winnerHighlight || isActive ? "#fff" : COLORS.text,
          fontWeight: "bold",
          fontSize: "1.14rem",
          minWidth: "2.2rem",
          display: "inline-block",
          letterSpacing: "0.09rem",
          boxShadow: winnerHighlight
            ? "0 1px 11px rgba(255,179,0,0.12)"
            : undefined,
          border: isActive ? `2px solid ${COLORS.primary}` : "2px solid transparent",
        }}
      >
        {player}
      </span>
    );
  }

  // PUBLIC_INTERFACE
  function renderGameInfo() {
    if (status === "draw") return <span>It&apos;s a draw!</span>;
    if (status === "ongoing")
      return (
        <>
          <span>
            {xIsNext ? "X" : "O"}&apos;s turn
            {mode === "ai" && !xIsNext ? " (AI)" : ""}
          </span>
        </>
      );
    // Else winner
    return <span className="winner">{status} wins!</span>;
  }

  // --- Main Render ---
  return (
    <div
      className="App"
      style={{
        background: COLORS.boardBg,
        minHeight: "100vh",
        color: COLORS.text,
        fontFamily: "Inter, Segoe UI, Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 420,
          margin: "0 auto",
          padding: "2.5rem 1.4rem 0 1.4rem",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "start",
          alignItems: "center",
        }}
      >
        {/* --- Score Display --- */}
        <div style={{ width: "100%", marginBottom: "1.3rem" }}>
          <h1
            style={{
              margin: "0",
              letterSpacing: "-1.5px",
              color: COLORS.primary,
              fontWeight: 900,
              fontSize: "2.05rem",
              textAlign: "center",
            }}
          >
            Tic Tac Toe
          </h1>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              margin: "1.3rem 0 0.2rem 0",
              fontSize: "1.07rem",
            }}
            aria-label="Player Scores"
          >
            {playerIndicator("X")}
            <span
              style={{
                color: COLORS.secondary,
                fontWeight: 600,
                opacity: 0.65,
                fontSize: "1rem",
                margin: "0 0.6rem",
              }}
            >
              {scores["X"]} - {scores["O"]}
            </span>
            {playerIndicator("O")}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "2.2rem",
              color: COLORS.secondary,
              fontWeight: "bold",
              fontSize: "0.94rem",
              marginTop: "0.15rem",
              marginBottom: "0.8rem",
              opacity: 0.78,
            }}
          >
            <span>Draws: {scores.draws}</span>
          </div>
        </div>

        {/* --- Game Board --- */}
        <div
          style={{
            margin: "0 auto 0.9rem auto",
            display: "grid",
            gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
            gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
            gap: "0.3rem",
            width: "min(95vw, 324px)",
            height: "min(95vw, 324px)",
            background: COLORS.cellBorder,
            borderRadius: "20px",
            boxShadow:
              "0 2px 18px rgba(25,118,210,0.09), 0 1.5px 4px rgba(117,117,117,0.04)",
          }}
          aria-label="Tic Tac Toe Board"
        >
          {board.map((cell, idx) => (
            <button
              aria-label={"Cell " + (idx + 1)}
              key={idx}
              className="ttt-cell"
              style={{
                appearance: "none",
                border: `2.3px solid ${COLORS.cellBorder}`,
                borderRadius: "12px",
                width: "100%",
                height: "100%",
                background: COLORS.cellBg,
                color:
                  cell === "X"
                    ? COLORS.primary
                    : cell === "O"
                    ? COLORS.accent
                    : COLORS.secondary,
                fontSize: "2.9rem",
                fontWeight: "800",
                outline: "none",
                cursor:
                  status !== "ongoing" || cell
                    ? "not-allowed"
                    : "pointer",
                transition: "background .18s, box-shadow .21s",
                boxShadow:
                  cell && status !== "ongoing"
                    ? `0 0 0 3px ${
                        status === cell ? COLORS.accent : COLORS.secondary
                      }30`
                    : undefined,
                userSelect: "none",
                lineHeight: "1.34",
                opacity: cell ? 1 : 0.97,
              }}
              disabled={!!cell || status !== "ongoing"}
              onClick={() => handleCellClick(idx)}
              tabIndex={0}
            >
              {cell ? cell : ""}
            </button>
          ))}
        </div>

        {/* --- Game Status --- */}
        <div
          style={{
            margin: "0.15rem 0 1rem 0",
            minHeight: "2.2rem",
            fontWeight: "700",
            fontSize: "1.13rem",
            letterSpacing: ".05rem",
            color:
              status === "ongoing"
                ? COLORS.primary
                : status === "draw"
                ? COLORS.secondary
                : COLORS.accent,
          }}
          role="status"
        >
          {renderGameInfo()}
        </div>

        {/* --- Controls --- */}
        <div
          style={{
            display: "flex",
            gap: "0.8rem",
            marginBottom: "1.1rem",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <button
            className="ttt-btn"
            style={{
              background: COLORS.primary,
              color: "#fff",
              fontWeight: 700,
              fontSize: "1.04rem",
              borderRadius: "7px",
              border: "none",
              padding: "0.49em 1.38em",
              boxShadow: "0 1.5px 5px rgba(25,118,210,0.12)",
              cursor: "pointer",
              transition: "background .21s",
            }}
            onClick={restartMatch}
            disabled={status === "ongoing" && board.every((c) => !c)}
            aria-label="Restart this match"
          >
            Restart
          </button>
          <button
            className="ttt-btn"
            style={{
              background: COLORS.accent,
              color: COLORS.text,
              fontWeight: 700,
              fontSize: "1.04rem",
              borderRadius: "7px",
              border: "none",
              padding: "0.49em 1.38em",
              boxShadow: "0 1.5px 5px rgba(255,179,0,0.11)",
              cursor: "pointer",
              transition: "background .21s",
            }}
            onClick={() => startNewGame(mode)}
            aria-label="Start a New Game"
          >
            New Game
          </button>
        </div>

        {/* --- Mode Selection --- */}
        <div
          style={{
            marginBottom: "1.8rem",
            textAlign: "center",
            color: COLORS.secondary,
            fontWeight: 600,
          }}
        >
          <span style={{ marginRight: "1.1em" }}>Game Mode:</span>
          <ModeSelector
            mode={mode}
            changeMode={changeMode}
            COLORS={COLORS}
            disabled={board.some(Boolean) && status === "ongoing"}
          />
        </div>
        <footer
          style={{
            marginTop: "auto",
            fontSize: "0.87rem",
            color: COLORS.secondary,
            fontWeight: 500,
            opacity: 0.62,
            padding: "0.6em",
            textAlign: "center",
            letterSpacing: "0.03em"
          }}
        >
          &copy; {new Date().getFullYear()} Tic Tac Toe Online &ndash; KAVIA
        </footer>
      </div>
    </div>
  );
}

// --- Mode Select Button Group ---
function ModeSelector({ mode, changeMode, COLORS, disabled }) {
  return (
    <span style={{ display: "inline-flex", gap: "0.6em" }}>
      <button
        className="ttt-mode-btn"
        style={{
          background: mode === "user" ? COLORS.primary : "#f1f3f4",
          color: mode === "user" ? "#fff" : COLORS.secondary,
          fontWeight: 600,
          fontSize: "0.97em",
          border: "none",
          outline: "none",
          padding: "0.46em 1.24em",
          borderRadius: "20px",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled && mode !== "user" ? 0.45 : 1,
          boxShadow:
            mode === "user"
              ? "0 1.5px 7px rgba(25,118,210,0.14)"
              : undefined,
          borderBottom: mode === "user" ? `2.5px solid ${COLORS.primary}` : "none",
          transition: "background .22s, color .18s"
        }}
        onClick={() => !disabled && changeMode("user")}
        disabled={disabled && mode !== "user"}
        aria-label="Play against another user"
      >
        vs User
      </button>
      <button
        className="ttt-mode-btn"
        style={{
          background: mode === "ai" ? COLORS.primary : "#f1f3f4",
          color: mode === "ai" ? "#fff" : COLORS.secondary,
          fontWeight: 600,
          fontSize: "0.97em",
          border: "none",
          outline: "none",
          padding: "0.46em 1.24em",
          borderRadius: "20px",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled && mode !== "ai" ? 0.45 : 1,
          boxShadow:
            mode === "ai"
              ? "0 1.5px 7px rgba(25,118,210,0.14)"
              : undefined,
          borderBottom: mode === "ai" ? `2.5px solid ${COLORS.primary}` : "none",
          transition: "background .22s, color .18s"
        }}
        onClick={() => !disabled && changeMode("ai")}
        disabled={disabled && mode !== "ai"}
        aria-label="Play against basic AI"
      >
        vs AI
      </button>
    </span>
  );
}

// PUBLIC_INTERFACE
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let [a, b, c] of lines) {
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return squares[a];
    }
  }
  return null;
}

// PUBLIC_INTERFACE
/** Basic AI: win if possible, block if must, else pick center/corner/first. */
function aiMove(board, aiPlayer = "O") {
  const opponent = aiPlayer === "X" ? "O" : "X";
  // Try to win
  for (const idx of emptyIndices(board)) {
    const tryBoard = [...board];
    tryBoard[idx] = aiPlayer;
    if (calculateWinner(tryBoard) === aiPlayer) return idx;
  }
  // Block opponent win
  for (const idx of emptyIndices(board)) {
    const tryBoard = [...board];
    tryBoard[idx] = opponent;
    if (calculateWinner(tryBoard) === opponent) return idx;
  }
  // Pick center
  if (!board[4]) return 4;
  // Corners preference
  const corners = [0, 2, 6, 8];
  const availableCorners = corners.filter((i) => !board[i]);
  if (availableCorners.length > 0)
    return availableCorners[Math.floor(Math.random() * availableCorners.length)];
  // Else, random empty
  const empties = emptyIndices(board);
  return empties[Math.floor(Math.random() * empties.length)];
}

function emptyIndices(board) {
  return board.map((cell, i) => (cell ? null : i)).filter((i) => i !== null);
}

export default App;
