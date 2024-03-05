import { useCallback, useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, ButtonGroup, Form, ListGroup } from "react-bootstrap";

type User = {
  id: string;
  name: string;
  email: string;
  role: "developer" | "manager" | "designer";
};

const people: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "johndoe@gmail.com",
    role: "developer",
  },
  {
    id: "2",
    name: "Jane Doe",
    email: "janedoe@gmail.com",
    role: "manager",
  },
  {
    id: "3",
    name: "Sam Smith",
    email: "samsmith@gmail.com",
    role: "designer",
  },
];

type MessageToObject = {
  payload: {
    filter: User["role"] | "all";
  };
  type: "object";
};

type MessageToString = {
  text: string;
  type: "string";
};

type MessageTo = MessageToObject | MessageToString;

function App() {
  const [users, setUsers] = useState<User[]>(people);
  const [filter, setFilter] = useState<User["role"] | "all">("all");
  const filteredUsers = users.filter(
    (user) => filter === "all" || user.role === filter
  );

  const [messageFromParent, setMessageFromParent] = useState("");

  const messageHandler = useCallback((event: MessageEvent) => {
    if (event.origin !== "http://localhost:5173") return;
    if (typeof event.data !== "string") return;
    let eventMessage: MessageTo;

    try {
      eventMessage = JSON.parse(event.data);
    } catch (error) {
      console.error("Error parsing JSON", error);
      return;
    }

      if (eventMessage.type === "object") {
        setFilter(eventMessage.payload.filter);
        return
      } 
      if (eventMessage.type === "string") {
        setMessageFromParent(eventMessage.text);
        return
      }
  }, []);

  const sendMessageToParent = useCallback((message: MessageTo) => {
    // if (window.parent.origin !== "http://localhost:5173") return;
    window.parent.postMessage(
      JSON.stringify(message),
      "http://localhost:5173/"
    );
  }
  , []);

  useEffect(() => {
    window.addEventListener("message", messageHandler);
    return () => {
      window.removeEventListener("message", messageHandler);
    };
  }, [messageHandler]);

  const [inputValue, setInputValue] = useState("");
  const handleChangeInputValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    sendMessageToParent({ text: e.target.value, type: "string" });
  };

  const handleClick = (message: User["role"] | "all") => {
    setFilter(message);
    sendMessageToParent({ payload: { filter: message }, type: "object" });
  };

  return (
    <div className="App">
      <h1>Child App</h1>
      <ButtonGroup>
        <Button
          onClick={() => handleClick("all")}
          variant="outline-primary"
          active={filter === "all"}
        >
          all
        </Button>
        <Button
          onClick={() => handleClick("developer")}
          variant="outline-primary"
          active={filter === "developer"}
        >
          developers
        </Button>
        <Button
          onClick={() => handleClick("manager")}
          variant="outline-primary"
          active={filter === "manager"}
        >
          managers
        </Button>
        <Button
          onClick={() => handleClick("designer")}
          variant="outline-primary"
          active={filter === "designer"}
        >
          designers
        </Button>
      </ButtonGroup>
      <ListGroup>
        {filteredUsers.map((user) => (
          <ListGroup.Item key={user.id}>
            {user.name} - {user.email} - {user.role}
          </ListGroup.Item>
        ))}
      </ListGroup>
      <div className="mt-5">
        <h2 className="h4">Message from parent</h2>
        <pre>{messageFromParent || "No message from parent yet..."}</pre>
        <Form>
          <h2 className="h4">Message to parent</h2>
          <Form.Control
            className="mt-3"
            value={inputValue}
            onChange={handleChangeInputValue}
            placeholder="Enter a message..."
          />
        </Form>
      </div>
    </div>
  );
}

export default App;
