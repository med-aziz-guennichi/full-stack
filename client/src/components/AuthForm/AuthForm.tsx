import {
  Avatar,
  Box,
  Button,
  Flex,
  Image,
  Input,
  VStack,
  useToast,
} from "@chakra-ui/react";
import Cookies from "js-cookie";
import { useRef, useState } from "react";
import { BeatLoader } from "react-spinners";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import AuthValidation from "./AuthValidation";

const AuthForm = () => {
  const { dispatch } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const toast = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [authValidationData, setAuthValidationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<File | null>(null);
  const [secureImg, setSecureImg] = useState("");
  const [inputs, setInputs] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };
  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      // Handle the selected file (e.g., upload it to a server, display it, etc.)
      const selectedFile = event.target.files[0];
      setImageUrl(selectedFile);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    if (imageUrl) {
      const data = new FormData();
      data.append("file", imageUrl);
      data.append("upload_preset", "tunisia-instagram");
      data.append("cloud_name", "dbrf2v9fm");

      fetch("https://api.cloudinary.com/v1_1/dbrf2v9fm/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data.secure_url);
          setSecureImg(data.secure_url);
        })
        .catch((err) => {
          console.log(err);
        });
    }
    try {
      const data = await api.post("/registration", {
        firstName: inputs.firstName,
        lastName: inputs.lastName,
        email: inputs.email,
        password: inputs.password,
        avatar: secureImg,
      });
      toast({
        title: "Success",
        description: "Please check your email to activate your account",
        status: "success",
        variant: "top-accent",
        duration: 5000,
        isClosable: true,
      });
      setAuthValidationData(data.data);
    } catch (error: any) {
      console.log(error);
      toast({
        title: "Error",
        description: `This email : "${inputs.email}" is already exist`,
        status: "error",
        variant: "top-accent",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  };

  const renderAuthValidation = () => {
    if (authValidationData) {
      return (
        <AuthValidation data={authValidationData} setIsLogin={setIsLogin} />
      );
    }
    return null; // You can return null if you don't want to render it
  };

  const handleLoginClick = async () => {
    setLoading(true);
    try {
      const response = await api.post(
        "/login",
        {
          email: inputs.email,
          password: inputs.password,
        },
        { withCredentials: true }
      );
      dispatch({
        type: "LOGIN",
        payload: { user: response.data.user, token: response.data.token },
      });
      Cookies.set("access_token", response.data.token); // Set an expiration time
      Cookies.set("refresh_token", response.data.refreshToken);
      Cookies.set("user", JSON.stringify(response.data.user));
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Invalid email or password",
        status: "error",
        variant: "top-accent",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  };

  return (
    <>
      <Box border={"1px solid gray"} borderRadius={4} padding={10}>
        <VStack spacing={4}>
          <Image src="/logo.png" h={24} cursor={"pointer"} alt="Instagram" />
          {renderAuthValidation()}
          {!isLogin ? (
            <>
              <Avatar
                src={imageUrl ? URL.createObjectURL(imageUrl) : ""}
                size="lg"
                sx={{ cursor: "pointer" }}
                onClick={handleAvatarClick}
              />
              <Input
                type="file"
                fontSize={14}
                required
                id="avatar-upload"
                accept="image/*"
                style={{ marginLeft: "20px" }}
                ref={fileInputRef}
                onChange={handleFileInputChange}
              />
              <Input
                placeholder="firstName"
                fontSize={14}
                type="text"
                value={inputs.firstName}
                isInvalid={inputs.firstName === ""}
                errorBorderColor="red.300"
                onChange={(e) =>
                  setInputs({ ...inputs, firstName: e.target.value })
                }
              />
              <Input
                placeholder="lastName"
                fontSize={14}
                type="text"
                isInvalid={inputs.lastName === ""}
                errorBorderColor="red.300"
                value={inputs.lastName}
                onChange={(e) =>
                  setInputs({ ...inputs, lastName: e.target.value })
                }
              />
            </>
          ) : null}
          <Input
            placeholder="Email"
            fontSize={14}
            type="email"
            value={inputs.email}
            isInvalid={inputs.email === ""}
            errorBorderColor="red.300"
            onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
          />
          <Input
            placeholder="Password"
            fontSize={14}
            type="password"
            isInvalid={inputs.password === ""}
            errorBorderColor="red.300"
            value={inputs.password}
            onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
          />

          {!isLogin ? (
            <Input
              placeholder="Confirm Password"
              value={inputs.confirmPassword}
              isInvalid={
                inputs.confirmPassword === "" ||
                inputs.password !== inputs.confirmPassword
              }
              errorBorderColor="red.300"
              onChange={(e) =>
                setInputs({ ...inputs, confirmPassword: e.target.value })
              }
              fontSize={14}
              type="password"
            />
          ) : null}

          <Button
            w={"full"}
            colorScheme="blue"
            size={"sm"}
            fontSize={14}
            isLoading={loading}
            spinner={<BeatLoader size={8} speedMultiplier={0.9} />}
            isDisabled={
              loading ||
              inputs.email === "" ||
              inputs.password === "" ||
              (!isLogin && inputs.confirmPassword === "") ||
              (!isLogin && inputs.password !== inputs.confirmPassword) ||
              (!isLogin && inputs.firstName === "") ||
              (!isLogin && inputs.lastName === "")
            }
            onClick={isLogin ? handleLoginClick : handleRegister}
          >
            {isLogin ? "Log in" : "Sign Up"}
          </Button>

          {/* ---------------- OR -------------- */}
          {/* <Flex
            alignItems={"center"}
            justifyContent={"center"}
            my={4}
            gap={1}
            w={"full"}
          >
            <Box flex={2} h={"1px"} bg={"gray.400"} />
            <Text mx={1} color={"white"}>
              OR
            </Text>
            <Box flex={2} h={"1px"} bg={"gray.400"} />
          </Flex> */}

          {/* <Flex
            alignItems={"center"}
            justifyContent={"center"}
            cursor={"pointer"}
          >
            <Image src="/google.png" w={5} alt="Google logo" />
            <Text mx="2" color={"blue.500"}>
              Log in with Google
            </Text>
          </Flex> */}
        </VStack>
      </Box>

      <Box border={"1px solid gray"} borderRadius={4} padding={5}>
        <Flex alignItems={"center"} justifyContent={"center"}>
          <Box mx={2} fontSize={14}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </Box>
          <Box
            onClick={() => setIsLogin(!isLogin)}
            color={"blue.500"}
            cursor={"pointer"}
          >
            {isLogin ? "Sign up" : "Log in"}
          </Box>
        </Flex>
      </Box>
    </>
  );
};

export default AuthForm;
